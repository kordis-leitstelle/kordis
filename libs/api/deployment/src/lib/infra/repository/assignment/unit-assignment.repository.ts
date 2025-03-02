import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
	DbSessionProvider,
	UnitOfWork,
	runDbOperation,
} from '@kordis/api/shared';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../../core/entity/deployment.entity';
import { UnitAssignmentRepository } from '../../../core/repository/unit-assignment.repository';
import { UnitAssignmentDocument } from '../../schema/deployment-assignment.schema';
import { DeploymentAlertGroupAggregate } from '../deployment/abstract-deployment.repository';

export class UnitAssignmentRepositoryImpl implements UnitAssignmentRepository {
	constructor(
		@InjectModel(UnitAssignmentDocument.name)
		private readonly unitAssignmentModel: Model<UnitAssignmentDocument>,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	async findAlertGroupOfUnit(
		orgId: string,
		unitId: string,
	): Promise<DeploymentAlertGroup | null> {
		const res = await this.unitAssignmentModel
			.aggregate([
				{
					$match: {
						orgId,
						entityId: unitId,
						alertGroupId: { $ne: null },
					},
				},
				{
					$lookup: {
						from: 'deployment-assignments',
						localField: 'alertGroupId',
						foreignField: 'entityId',
						as: 'alertGroup',
					},
				},
				{
					$lookup: {
						from: 'deployment-assignments',
						localField: 'alertGroupId',
						foreignField: 'alertGroupId',
						as: 'alertGroupUnits',
					},
				},
				{
					$set: {
						alertGroup: {
							$arrayElemAt: ['$alertGroups', 0],
						},
					},
				},
				{
					$addFields: {
						'alertGroup.assignedUnitIds': {
							$map: {
								input: '$alertGroupUnits',
								as: 'item',
								in: '$$item.entityId',
							},
						},
					},
				},
				{
					$replaceRoot: {
						newRoot: '$alertGroup',
					},
				},
			])
			.exec();

		return res?.[0]
			? this.mapper.map(
					res?.[0],
					DeploymentAlertGroupAggregate,
					DeploymentAlertGroup,
				)
			: null;
	}

	async removeAssignmentsFromAlertGroups(
		orgId: string,
		alertGroupIds: string[],
		uow?: UnitOfWork | undefined,
	): Promise<void> {
		const operation = this.unitAssignmentModel.updateMany(
			{
				orgId,
				alertGroupId: { $in: alertGroupIds },
			},
			{
				$set: {
					alertGroupId: null,
				},
			},
		);
		await runDbOperation(operation, uow);
	}

	async getUnitsOfAlertGroup(
		orgId: string,
		alertGroupId: string,
	): Promise<DeploymentUnit[]> {
		const res = await this.unitAssignmentModel
			.aggregate([
				{
					$match: {
						orgId,
						alertGroupId,
					},
				},
				{
					$project: {
						entityId: 1,
					},
				},
			])
			.exec();

		return this.mapper.mapArray(res, UnitAssignmentDocument, DeploymentUnit);
	}

	async removeAlertGroupFromUnits(
		orgId: string,
		unitIds: string[],
		uow?: DbSessionProvider,
	): Promise<void> {
		const operation = this.unitAssignmentModel.updateMany(
			{
				orgId,
				entityId: { $in: unitIds },
			},
			{
				$set: {
					alertGroupId: null,
				},
			},
		);
		await runDbOperation(operation, uow);
	}

	async setAlertGroupAssignment(
		orgId: string,
		unitIds: string[],
		alertGroupId: string,
		uow?: UnitOfWork | undefined,
	): Promise<void> {
		const operation = this.unitAssignmentModel.updateMany(
			{
				orgId,
				entityId: { $in: unitIds },
			},
			{
				$set: {
					alertGroupId,
				},
			},
		);
		await runDbOperation(operation, uow);
	}
}
