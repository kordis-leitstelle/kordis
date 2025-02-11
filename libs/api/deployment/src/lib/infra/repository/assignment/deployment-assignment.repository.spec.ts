import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { BaseModelProfile } from '@kordis/api/shared';
import { mockModelMethodResults } from '@kordis/api/test-helpers';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../../core/entity/deployment.entity';
import { OperationDeploymentEntity } from '../../../core/entity/operation-deplyoment.entity';
import { RescueStationDeploymentEntity } from '../../../core/entity/rescue-station-deployment.entity';
import { DeploymentAggregateProfile } from '../../mapper/deployment-aggregate.mapper-profile';
import { DeploymentAssignmentProfile } from '../../mapper/deployment-assignment.mapper-profile';
import { OperationDeploymentAggregateProfile } from '../../mapper/operation-deployment-aggregate.mapper-profile';
import {
	RescueStationDeploymentAggregateProfile,
	RescueStationDeploymentValueObjectProfile,
} from '../../mapper/rescue-station-deployment-aggregate.mapper-profile';
import { DeploymentAssignmentsDocument } from '../../schema/deployment-assignment.schema';
import { DeploymentType } from '../../schema/deployment-type.enum';
import { DeploymentAssignmentRepositoryImpl } from './deployment-assignment.repository';

describe('DeploymentAssignmentRepositoryImpl', () => {
	let repository: DeploymentAssignmentRepositoryImpl;
	let deploymentAssignmentModel: Model<DeploymentAssignmentsDocument>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				BaseModelProfile,
				DeploymentAggregateProfile,
				DeploymentAssignmentProfile,
				RescueStationDeploymentAggregateProfile,
				RescueStationDeploymentValueObjectProfile,
				OperationDeploymentAggregateProfile,
				DeploymentAssignmentRepositoryImpl,
				{
					provide: getModelToken(DeploymentAssignmentsDocument.name),
					useValue: createMock<Model<DeploymentAssignmentsDocument>>(),
				},
			],
		}).compile();

		repository = module.get<DeploymentAssignmentRepositoryImpl>(
			DeploymentAssignmentRepositoryImpl,
		);
		deploymentAssignmentModel = module.get<
			Model<DeploymentAssignmentsDocument>
		>(getModelToken(DeploymentAssignmentsDocument.name));
	});

	it('should remove assignments of deployments', async () => {
		const orgId = 'orgId';
		await repository.removeAssignmentsOfDeployments(orgId, [
			'66e5f31aa96f93b44258a95a',
			'66e5f3219c84a443529a021d',
		]);

		expect(deploymentAssignmentModel.updateMany).toHaveBeenCalledWith(
			{
				orgId,
				deploymentId: {
					$in: [
						new Types.ObjectId('66e5f31aa96f93b44258a95a'),
						new Types.ObjectId('66e5f3219c84a443529a021d'),
					],
				},
			},
			{
				$set: {
					deploymentId: null,
				},
			},
			{
				session: undefined,
			},
		);
	});

	it('should get rescue station assignment', async () => {
		const orgId = 'orgId';
		const entityId = 'entityId';
		mockModelMethodResults(
			deploymentAssignmentModel,
			[
				{
					deployment: [
						{
							type: DeploymentType.RESCUE_STATION,
							name: 'somename',
							defaultUnitIds: ['someUnitId1', 'someUnitId2'],
						},
					],
				},
			],
			'aggregate',
		);

		const result = await repository.getAssignment(orgId, entityId);
		expect(result).not.toBeNull();
		expect(result).toBeInstanceOf(RescueStationDeploymentEntity);
		expect((result as RescueStationDeploymentEntity)!.name).toEqual('somename');
		expect((result as RescueStationDeploymentEntity)!.defaultUnits).toEqual([
			{ id: 'someUnitId1' },
			{ id: 'someUnitId2' },
		]);
	});

	it('should get operation assignment', async () => {
		const orgId = 'orgId';
		const entityId = 'entityId';
		mockModelMethodResults(
			deploymentAssignmentModel,
			[
				{
					deployment: [
						{
							type: DeploymentType.OPERATION,
							operationId: 'someForeignOperationId',
						},
					],
				},
			],
			'aggregate',
		);

		const result = await repository.getAssignment(orgId, entityId);
		expect(result).not.toBeNull();
		expect(result).toBeInstanceOf(OperationDeploymentEntity);
		expect((result as OperationDeploymentEntity)!.operation.id).toEqual(
			'someForeignOperationId',
		);
	});

	it('should get unassigned', async () => {
		const orgId = 'orgId';

		mockModelMethodResults(
			deploymentAssignmentModel,
			[
				{
					units: [{ entityId: 'someUnitId' }],
					alertGroups: [
						{
							entityId: 'someAlertGroupId',
							assignedUnitIds: ['someOtherUnitId'],
						},
					],
				},
			],
			'aggregate',
		);

		const result = await repository.getUnassigned(orgId);

		expect(result).toEqual([
			{
				alertGroup: {
					id: 'someAlertGroupId',
				},
				assignedUnits: [
					{
						unit: {
							id: 'someOtherUnitId',
						},
					},
				],
			},
			{
				unit: {
					id: 'someUnitId',
				},
			},
		]);
		expect(result[0]).toBeInstanceOf(DeploymentAlertGroup);
		expect(result[1]).toBeInstanceOf(DeploymentUnit);
	});

	it('should remove assignments of deployment', async () => {
		const orgId = 'orgId';
		const deploymentId = '662b83b325f7a66dd0fd53de';

		await repository.removeAssignmentsOfDeployment(orgId, deploymentId);
		expect(deploymentAssignmentModel.updateMany).toHaveBeenCalled();
	});

	it('should assign entities to deployment', async () => {
		const orgId = 'orgId';
		const deploymentId = '662b83b325f7a66dd0fd53de';
		const entityIds = ['entityId1', 'entityId2'];

		await repository.assignEntitiesToDeployment(orgId, deploymentId, entityIds);

		expect(deploymentAssignmentModel.updateMany).toHaveBeenCalled();
	});
});
