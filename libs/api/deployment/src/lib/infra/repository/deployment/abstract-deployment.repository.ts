import { Mapper, ModelIdentifier } from '@automapper/core';
import { FilterQuery, Model } from 'mongoose';

import { DbSessionProvider, runDbOperation } from '@kordis/api/shared';

import { BaseDeploymentEntity } from '../../../core/entity/deployment.entity';
import { DeploymentNotFoundException } from '../../../core/exception/deployment-not-found.exception';
import { DeploymentRepository } from '../../../core/repository/deployment.repository';
import {
	AlertGroupAssignmentDocument,
	DeploymentAssignmentType,
	UnitAssignmentDocument,
} from '../../schema/deployment-assignment.schema';
import { BaseDeploymentDocument } from '../../schema/deployment.schema';

export class DeploymentAlertGroupAggregate extends AlertGroupAssignmentDocument {
	assignedUnitIds: string[];
}

export class DeploymentAggregate {
	alertGroups: DeploymentAlertGroupAggregate[];
	units: UnitAssignmentDocument[];
}

const ASSIGNMENT_JOIN_PIPELINE_STEPS = Object.freeze([
	{
		$lookup: {
			from: 'deployment-assignments',
			let: { deploymentId: '$_id' },
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$deploymentId', '$$deploymentId'] },
								{ $eq: ['$type', DeploymentAssignmentType.ALERT_GROUP] },
							],
						},
					},
				},
				{
					$lookup: {
						from: 'deployment-assignments',
						localField: 'entityId',
						foreignField: 'alertGroupId',
						as: 'units',
					},
				},
				{
					$addFields: {
						assignedUnitIds: {
							$map: {
								input: '$units',
								as: 'item',
								in: '$$item.entityId',
							},
						},
					},
				},
				{
					$project: {
						entityId: 1,
						assignedUnitIds: 1,
						_id: 0,
					},
				},
			],
			as: 'alertGroups',
		},
	},
	{
		$lookup: {
			from: 'deployment-assignments',
			let: { deploymentId: '$_id' },
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$deploymentId', '$$deploymentId'] },
								{ $eq: ['$type', DeploymentAssignmentType.UNIT] },
								{ $eq: ['$alertGroupId', null] },
							],
						},
					},
				},
				{ $project: { entityId: 1, _id: 0 } },
			],
			as: 'units',
		},
	},
]);

export abstract class DeploymentRepositoryImpl<
	TEntity extends BaseDeploymentEntity,
	TEntityDTO extends Partial<TEntity>,
	TDocument extends BaseDeploymentDocument,
> implements DeploymentRepository<TEntity, TEntityDTO>
{
	protected constructor(
		protected readonly deploymentModel: Model<TDocument>,
		private readonly mapper: Mapper,
		private readonly entityTypeValue: ModelIdentifier<TEntity>,
		private readonly documentTypeValue: ModelIdentifier<TDocument>,
		private readonly documentDtoTypeValue: ModelIdentifier<Partial<TDocument>>,
		private readonly entityDtoTypeValue: ModelIdentifier<TEntityDTO>,
	) {}

	async findById(orgId: string, id: string): Promise<TEntity> {
		const deployment = await this.deploymentModel
			.aggregate([
				{
					$match: {
						orgId,
						referenceId: id,
					},
				},
				...ASSIGNMENT_JOIN_PIPELINE_STEPS,
			])
			.exec();

		if (!deployment?.[0]) {
			throw new DeploymentNotFoundException();
		}

		return this.mapper.mapAsync(
			deployment[0],
			this.documentTypeValue,
			this.entityTypeValue,
		);
	}

	async findByOrgId(
		orgId: string,
		filter?: TEntityDTO,
		uow?: DbSessionProvider,
	): Promise<TEntity[]> {
		const filterDoc = filter
			? await this.mapper.mapAsync(
					filter,
					this.entityDtoTypeValue,
					this.documentDtoTypeValue,
				)
			: {};

		const query = this.deploymentModel.aggregate(
			[
				{
					$match: {
						...filterDoc,
						orgId,
					},
				},
				...ASSIGNMENT_JOIN_PIPELINE_STEPS,
			],
			{},
		);
		const deployments = await runDbOperation(query, uow);

		return this.mapper.mapArrayAsync(
			deployments,
			this.documentTypeValue,
			this.entityTypeValue,
		);
	}

	async updateOne(
		orgId: string,
		id: string,
		data: TEntityDTO,
		uow?: DbSessionProvider,
	): Promise<void> {
		const updateDoc = await this.mapper.mapAsync(
			data,
			this.entityDtoTypeValue,
			this.documentDtoTypeValue,
		);

		const query = this.deploymentModel.updateOne(
			{
				orgId,
				_id: id,
			} as FilterQuery<TDocument>,
			{
				$set: updateDoc,
			},
		);

		await runDbOperation(query, uow);
	}
}
