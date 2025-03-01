import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { DbSessionProvider, runDbOperation } from '@kordis/api/shared';

import {
	CreateUnitInvolvementDto,
	OperationInvolvementsRepository,
	UnitInvolvement,
} from '../../core/repository/operation-involvement.repository';
import { OperationInvolvementDocument } from '../schema/operation-involvement.schema';

export class OperationInvolvementsRepositoryImpl
	implements OperationInvolvementsRepository
{
	constructor(
		@InjectModel(OperationInvolvementDocument.name)
		private readonly operationInvolvementModel: Model<OperationInvolvementDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findOperationInvolvement(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement | undefined> {
		const query = this.operationInvolvementModel.findOne({
			orgId,
			operation: new Types.ObjectId(operationId),
			unitId,
			alertGroupId,
		});
		const res = await runDbOperation(query, uow);
		return res ? this.mapOperationInvolvementToModel(res) : undefined;
	}

	async setPendingState(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		isPending: boolean,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.operationInvolvementModel.updateOne(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId,
				alertGroupId,
			},
			{
				$set: {
					isPending,
				},
			},
		);

		await runDbOperation(query, uow);
	}

	async createInvolvements(
		orgId: string,
		operationId: string,
		involvements: CreateUnitInvolvementDto[],
		uow?: DbSessionProvider,
	): Promise<void> {
		const documents: OperationInvolvementDocument[] = involvements.map(
			(dto) => ({
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId: dto.unitId,
				involvementTimes: dto.involvementTimes,
				alertGroupId: dto.alertGroupId,
				isPending: dto.isPending,
			}),
		);

		await this.operationInvolvementModel.create(
			documents,
			uow?.session ? { session: uow?.session } : undefined,
		);
	}

	async removeAllPending(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.operationInvolvementModel.deleteMany({
			orgId,
			operation: new Types.ObjectId(operationId),
			isPending: true,
		});

		await runDbOperation(query, uow);
	}

	async setEndOfAllActive(
		orgId: string,
		operationId: string,
		end: Date,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.operationInvolvementModel.updateMany(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				'involvementTimes.end': null,
			},
			{
				$set: {
					'involvementTimes.$.end': end,
				},
			},
		);

		await runDbOperation(query, uow);
	}

	async setEnd(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		end: Date,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.operationInvolvementModel.updateOne(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId,
				alertGroupId,
				'involvementTimes.end': null,
			},
			{
				$set: {
					'involvementTimes.$.end': end,
				},
			},
		);

		await runDbOperation(query, uow);
	}

	async removeInvolvements(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.operationInvolvementModel.deleteMany({
			orgId,
			operation: new Types.ObjectId(operationId),
		});

		await runDbOperation(query, uow);
	}

	async removeInvolvement(
		orgId: string,
		unitId: string,
		alertGroupId: string | null,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<void> {
		const query = this.operationInvolvementModel.deleteOne({
			orgId,
			unitId,
			alertGroupId,
			operation: new Types.ObjectId(operationId),
		});

		await runDbOperation(query, uow);
	}

	async findByUnitInvolvementTimeRange(
		orgId: string,
		unitId: string,
		start: Date,
		end: Date | null,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement | undefined> {
		let filter: FilterQuery<OperationInvolvementDocument>;
		if (!end) {
			// if open involvement (currently involved), check if the unit is actively involved
			filter = {
				'involvementTimes.end': null,
			};
		} else {
			// else check if the unit was involved at the given time
			filter = {
				'involvementTimes.start': { $lte: end },
				'involvementTimes.end': { $gte: start },
			};
		}

		const query = this.operationInvolvementModel
			.findOne({
				orgId,
				unitId,
				...filter,
				isDeleted: false,
			})
			.lean();
		const res = await runDbOperation(query, uow);
		return res ? this.mapOperationInvolvementToModel(res) : undefined;
	}

	async addStartOfPendingUnit(
		orgId: string,
		operationId: string,
		unitId: string,
		start: Date,
	): Promise<void> {
		await this.operationInvolvementModel.updateOne(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId: unitId,
				isPending: true,
			},
			{
				$set: {
					isPending: false,
				},
				$push: {
					involvementTimes: { start, end: null },
				},
			},
		);
	}

	async findInvolvementOfPendingUnit(
		orgId: string,
		unitId: string,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement | undefined> {
		const query = this.operationInvolvementModel
			.findOne({
				orgId,
				unitId,
				isPending: true,
				isDeleted: false,
			})
			.lean();

		const res = await runDbOperation(query, uow);
		return res ? this.mapOperationInvolvementToModel(res) : undefined;
	}

	async setDeletedFlag(
		orgId: string,
		operationId: string,
		deleted: boolean,
		uow?: DbSessionProvider,
	): Promise<void> {
		await this.operationInvolvementModel.updateMany(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
			},
			{
				$set: {
					isDeleted: deleted,
				},
			},
			{ session: uow?.session },
		);
	}

	private mapOperationInvolvementToModel(
		doc: OperationInvolvementDocument,
	): UnitInvolvement {
		return {
			unitId: doc.unitId,
			operationId: doc.operation.toString(),
			involvementTimes: doc.involvementTimes,
			alertGroupId: doc.alertGroupId,
			isPending: doc.isPending,
		};
	}
}
