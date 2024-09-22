import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { BaseModelProfile } from '@kordis/api/shared';
import { mockModelMethodResults } from '@kordis/api/test-helpers';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../../core/entity/deployment.entity';
import { DeploymentAssignmentProfile } from '../../mapper/deployment-assignment.mapper-profile';
import { UnitAssignmentDocument } from '../../schema/deployment-assignment.schema';
import { UnitAssignmentRepositoryImpl } from './unit-assignment.repository';

describe('UnitAssignmentRepositoryImpl', () => {
	let repository: UnitAssignmentRepositoryImpl;
	let unitAssignmentModel: Model<UnitAssignmentDocument>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				BaseModelProfile,
				DeploymentAssignmentProfile,
				UnitAssignmentRepositoryImpl,
				{
					provide: getModelToken(UnitAssignmentDocument.name),
					useValue: createMock<Model<UnitAssignmentDocument>>(),
				},
			],
		}).compile();

		repository = module.get<UnitAssignmentRepositoryImpl>(
			UnitAssignmentRepositoryImpl,
		);
		unitAssignmentModel = module.get<Model<UnitAssignmentDocument>>(
			getModelToken(UnitAssignmentDocument.name),
		);
	});

	it('should get alert group of unit', async () => {
		const orgId = 'orgId';
		const unitId = 'unitId';

		const mockResult = [
			{
				orgId,
				entityId: 'alertGroupId',
				assignedUnitIds: ['unitId'],
			},
		];

		mockModelMethodResults(unitAssignmentModel, mockResult, 'aggregate');

		const result = await repository.findAlertGroupOfUnit(orgId, unitId);

		const expectedResult = new DeploymentAlertGroup();
		expectedResult.alertGroup = { id: 'alertGroupId' };
		const expectedDeploymentUnit = new DeploymentUnit();
		expectedDeploymentUnit.unit = { id: 'unitId' };
		expectedResult.assignedUnits = [expectedDeploymentUnit];

		expect(result).toEqual(expectedResult);
	});

	it('should remove alert group assignments by alert groups', async () => {
		const orgId = 'orgId';
		const alertGroupIds = ['alertGroupId1', 'alertGroupId2'];

		await repository.removeAssignmentsFromAlertGroups(orgId, alertGroupIds);

		expect(unitAssignmentModel.updateMany).toHaveBeenCalled();
	});

	it('should get units of alert groups', async () => {
		const orgId = 'orgId';
		const alertGroupId = 'alertGroupId';

		const mockResult = [{ entityId: 'unitId1' }, { entityId: 'unitId2' }];

		mockModelMethodResults(unitAssignmentModel, mockResult, 'aggregate');

		const result = await repository.getUnitsOfAlertGroup(orgId, alertGroupId);

		const expectedUnit1 = new DeploymentUnit();
		expectedUnit1.unit = { id: 'unitId1' };
		const expectedUnit2 = new DeploymentUnit();
		expectedUnit2.unit = { id: 'unitId2' };

		expect(result).toEqual([expectedUnit1, expectedUnit2]);
	});

	it('should remove alert group assignments from units', async () => {
		const orgId = 'orgId';
		const unitIds = ['unitId1', 'unitId2'];

		await repository.removeAlertGroupFromUnits(orgId, unitIds);

		expect(unitAssignmentModel.updateMany).toHaveBeenCalled();
	});

	it('should set alert group assignment', async () => {
		const orgId = 'orgId';
		const unitIds = ['unitId1', 'unitId2'];
		const alertGroupId = 'alertGroupId';

		await repository.setAlertGroupAssignment(orgId, unitIds, alertGroupId);

		expect(unitAssignmentModel.updateMany).toHaveBeenCalled();
	});
});
