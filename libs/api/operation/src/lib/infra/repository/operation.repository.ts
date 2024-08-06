import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import {
	DbSessionProvider,
	MongoEncryptionService,
	runDbOperation,
} from '@kordis/api/shared';

import { OperationProcessState } from '../../core/entity/operation-process-state.enum';
import { OperationEntity } from '../../core/entity/operation.entity';
import { OperationNotFoundException } from '../../core/exceptions/operation-not-found.exception';
import { CreateOperationDto } from '../../core/repository/dto/create-operation.dto';
import { OperationFilterDto } from '../../core/repository/dto/operation-filter.dto';
import { UpdateOperationDto } from '../../core/repository/dto/update-operation.dto';
import { OperationRepository } from '../../core/repository/operation.repository';
import { OperationDocument } from '../schema/operation.schema';
import { OperationAggregateModel } from './operation-aggregate.model';
import { UpdateOperationDocumentDto } from './update-operation-document.dto';


const INVOLVEMENT_LOOKUPS = Object.freeze([
	{
		$lookup: {
			from: 'operation-involvements',
			let: {
				operationId: '$_id',
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{
									$eq: ['$operation', '$$operationId'],
								},
								{
									$eq: ['$alertGroupId', null],
								},
							],
						},
					},
				},
				{
					$project: {
						_id: 0,
						unitId: 1,
						involvementTimes: 1,
						isPending: 1,
					},
				},
			],
			as: 'unitInvolvements',
		},
	},
	{
		$lookup: {
			from: 'operation-involvements',
			let: {
				operationId: '$_id',
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{
									$eq: ['$operation', '$$operationId'],
								},
								{
									$ne: ['$alertGroupId', null],
								},
							],
						},
					},
				},
				{
					$group: {
						_id: '$alertGroupId',
						unitInvolvements: {
							$push: {
								unitId: '$unitId',
								involvementTimes: '$involvementTimes',
								isPending: '$isPending',
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						unitId: 1,
						alertGroupId: '$_id',
						unitInvolvements: 1,
					},
				},
			],
			as: 'alertGroupInvolvements',
		},
	},
]);

export class OperationRepositoryImpl implements OperationRepository {
	constructor(
		@InjectModel(OperationDocument.name)
		private readonly operationModel: Model<OperationDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
		private readonly encrService: MongoEncryptionService,
	) {}

	async findById(
		orgId: string,
		id: string,
		uow?: DbSessionProvider,
	): Promise<OperationEntity> {
		const pipeline = this.operationModel.aggregate([
			{
				$match: {
					orgId,
					_id: new Types.ObjectId(id),
					processState: { $ne: OperationProcessState.DELETED },
				},
			},
			...INVOLVEMENT_LOOKUPS,
		]);

		const res = await runDbOperation(pipeline, uow);
		if (!res?.[0]) {
			throw new OperationNotFoundException();
		}
		console.log(res);
		return this.mapper.mapAsync(
			res[0],
			OperationAggregateModel,
			OperationEntity,
		);
	}

	async update(
		orgId: string,
		operationId: string,
		updateDto: Partial<UpdateOperationDto>,
		uow?: DbSessionProvider | undefined,
	): Promise<void> {
		const updateDocumentDto = await this.mapper.mapAsync<
			Partial<UpdateOperationDto>,
			Partial<UpdateOperationDocumentDto>
		>(updateDto, UpdateOperationDto, UpdateOperationDocumentDto);

		if (updateDocumentDto.patients?.length) {
			updateDocumentDto.patients = await this.encrService.encryptArray(
				updateDocumentDto.patients,
				'Random',
			);
		}

		await this.operationModel
			.updateOne(
				{
					orgId,
					_id: new Types.ObjectId(operationId),
				},
				{
					$set: updateDocumentDto,
				},
				{ session: uow?.session },
			)
			.exec();
	}

	async create(
		orgId: string,
		createDto: CreateOperationDto,
		uow?: DbSessionProvider,
	): Promise<{ id: string }> {
		const operationDoc = await this.operationModel.create(
			[
				{
					orgId,
					...createDto,
				},
			],
			uow?.session ? { session: uow.session } : undefined,
		);
		return {
			id: operationDoc[0]._id.toString(),
		};
	}

	async findLatestOperationSign(
		orgId: string,
		uow?: DbSessionProvider,
	): Promise<string | undefined> {
		const query = this.operationModel
			.findOne({ orgId, processState: { $ne: OperationProcessState.DELETED } })
			.select('sign')
			.sort({ sign: -1 })
			.lean();

		const operationWithLeadingSign = await runDbOperation(query, uow);
		return operationWithLeadingSign?.sign;
	}

	async findByOrgId(
		orgId: string,
		filter: Partial<OperationFilterDto> = {},
		sortBySignDesc = false,
	): Promise<OperationEntity[]> {
		const filterQuery: FilterQuery<OperationDocument> = {};
		if (filter.processStates?.length) {
			filterQuery['processState'] = {
				$in: filter.processStates,
			};
		}

		filterQuery['processState'] = {
			...filterQuery['processState'],
			$ne: OperationProcessState.DELETED,
		};

		let query = this.operationModel.aggregate([
			{
				$match: {
					...filterQuery,
					orgId,
				},
			},
			...INVOLVEMENT_LOOKUPS,
		]);

		if (sortBySignDesc) {
			query = query.sort({ sign: -1 });
		}
		const res = await query.exec();
		return this.mapper.mapArrayAsync(
			res,
			OperationAggregateModel,
			OperationEntity,
		);
	}
}
