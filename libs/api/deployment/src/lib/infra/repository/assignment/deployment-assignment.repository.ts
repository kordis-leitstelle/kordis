import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { DbSessionProvider, runDbOperation } from '@kordis/api/shared';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../../../core/entity/rescue-station-deployment.entity';
import { DeploymentAssignmentRepository } from '../../../core/repository/deployment-assignment.repository';
import {
	DeploymentAssignmentType,
	DeploymentAssignmentsDocument,
	UnitAssignmentDocument,
} from '../../schema/deployment-assignment.schema';
import { RescueStationDeploymentDocument } from '../../schema/rescue-station-deployment.schema';
import { DeploymentAlertGroupAggregate } from '../deployment/abstract-deployment.repository';

@Injectable()
export class DeploymentAssignmentRepositoryImpl
	implements DeploymentAssignmentRepository
{
	constructor(
		@InjectModel(DeploymentAssignmentsDocument.name)
		private readonly deploymentAssignmentModel: Model<DeploymentAssignmentsDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async removeAssignmentsOfDeployments(
		orgId: string,
		deploymentIds: string[],
		uow?: DbSessionProvider | undefined,
	): Promise<void> {
		await this.deploymentAssignmentModel.updateMany(
			{
				orgId,
				deploymentId: {
					$in: deploymentIds.map((id) => new Types.ObjectId(id)),
				},
			},
			{
				$set: {
					deploymentId: null,
				},
			},
			{
				session: uow?.session,
			},
		);
	}

	/*
	 * Get assignment of a unit or alert group.
	 * @param orgId The organization id.
	 * @param entityId The id of the unit or the alert group.
	 */
	async getAssignment(
		orgId: string,
		entityId: string,
	): Promise<RescueStationDeploymentEntity | null> {
		const assignment = await this.deploymentAssignmentModel
			.aggregate([
				{
					$match: {
						orgId,
						entityId,
					},
				},
				{
					$lookup: {
						from: 'deployments',
						localField: 'deploymentId',
						foreignField: '_id',
						as: 'deployment',
					},
				},
			])
			.exec();

		if (assignment.length > 0 && assignment[0].deployment.length > 0) {
			return this.mapper.map(
				assignment[0].deployment[0],
				RescueStationDeploymentDocument,
				RescueStationDeploymentEntity,
			);
		}

		return null;
	}

	/*
	 * Get unassigned units and alert groups.
	 * @param orgId The organization id.
	 */
	async getUnassigned(
		orgId: string,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]> {
		const unassignedEntities = await this.deploymentAssignmentModel
			.aggregate([
				// where a unit has no assignment
				{
					$match: {
						orgId,
						deploymentId: null,
					},
				},
				// get alert groups and units
				{
					$facet: {
						alertGroups: [
							{
								$match: {
									type: DeploymentAssignmentType.ALERT_GROUP,
								},
							},
							// get units that are assigned to that alert group
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
									_id: 0,
									entityId: 1,
									assignedUnitIds: 1,
								},
							},
						],
						units: [
							{
								$match: {
									type: DeploymentAssignmentType.UNIT,
									alertGroupId: null,
								},
							},
							{
								$project: {
									_id: 0,
									entityId: 1,
								},
							},
						],
					},
				},
			])
			.exec();

		return Promise.all([
			this.mapper.mapArrayAsync(
				unassignedEntities[0].alertGroups,
				DeploymentAlertGroupAggregate,
				DeploymentAlertGroup,
			),
			this.mapper.mapArrayAsync(
				unassignedEntities[0].units,
				UnitAssignmentDocument,
				DeploymentUnit,
			),
		]).then(([units, alertGroups]) => [...units, ...alertGroups]);
	}

	/*
	 * Removes all assignments (units and alert groups with their units) of a deployment,
	 * @param orgId The organization id.
	 * @param deploymentId The deployment id.
	 * @param uow The unit of work.
	 */
	async removeAssignmentsOfDeployment(
		orgId: string,
		deploymentId: string,
		uow?: DbSessionProvider,
	): Promise<void> {
		const operation = this.deploymentAssignmentModel.updateMany(
			{
				orgId,
				deploymentId: new Types.ObjectId(deploymentId),
			},
			{
				$set: {
					deploymentId: null,
				},
			},
		);

		await runDbOperation(operation, uow);
	}

	/*
	 * Assigns units and alert groups to a deployment.
	 * @param orgId The organization id.
	 * @param deploymentId The deployment id.
	 * @param entityIds The ids of units and/or alert groups.
	 * @param uow The unit of work.
	 */
	async assignEntitiesToDeployment(
		orgId: string,
		deploymentId: string,
		entityIds: string[],
		uow?: DbSessionProvider | undefined,
	): Promise<void> {
		const operation = this.deploymentAssignmentModel.updateMany(
			{
				orgId,
				entityId: { $in: entityIds },
			},
			{
				$set: {
					deploymentId: new Types.ObjectId(deploymentId),
				},
			},
		);

		await runDbOperation(operation, uow);
	}
}
