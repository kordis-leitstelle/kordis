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

		const result = await repository.getAlertGroupOfUnit(orgId, unitId);

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

		const fnSpy = jest.spyOn(unitAssignmentModel, 'updateMany');

		await repository.removeAlertGroupAssignmentsByAlertGroups(
			orgId,
			alertGroupIds,
		);

		expect(fnSpy).toHaveBeenCalled();
	});

	it('should remove alert group assignments from units', async () => {
		const orgId = 'orgId';
		const unitIds = ['unitId1', 'unitId2'];

		const fnSpy = jest.spyOn(unitAssignmentModel, 'updateMany');

		await repository.removeAlertGroupAssignmentsFromUnits(orgId, unitIds);

		expect(fnSpy).toHaveBeenCalled();
	});

	it('should set alert group assignment', async () => {
		const orgId = 'orgId';
		const unitIds = ['unitId1', 'unitId2'];
		const alertGroupId = 'alertGroupId';

		const fnSpy = jest.spyOn(unitAssignmentModel, 'updateMany');

		await repository.setAlertGroupAssignment(orgId, unitIds, alertGroupId);

		expect(fnSpy).toHaveBeenCalled();
	});
});
