import { createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { GetAlertGroupByUnitIdQuery } from '../../core/query/get-alert-group-by-unit-id.query';
import { GetDeployableEntityAssignment } from '../../core/query/get-deployable-entity.assignment';
import {
	AlertGroupAssignmentResolver,
	EntityRescueStationAssignment,
	UnitAssignmentResolver,
} from './deployment-assignment.resolver';

describe('UnitAssignmentResolver', () => {
	let resolver: UnitAssignmentResolver;
	const mockQueryBus = createMock<QueryBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitAssignmentResolver,
				{ provide: QueryBus, useValue: mockQueryBus },
			],
		}).compile();

		resolver = module.get<UnitAssignmentResolver>(UnitAssignmentResolver);
	});

	it('should get assignment', async () => {
		const orgId = 'orgId';
		const unitId = 'unitId';
		const mockEntityRescueStationAssignment =
			new EntityRescueStationAssignment();
		mockEntityRescueStationAssignment.note = 'somenote';
		mockQueryBus.execute.mockResolvedValueOnce(
			mockEntityRescueStationAssignment,
		);

		const result = await resolver.assignment(
			{ organizationId: orgId } as AuthUser,
			{ id: unitId } as UnitViewModel,
		);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetDeployableEntityAssignment(orgId, unitId),
		);
		expect(result).toEqual(mockEntityRescueStationAssignment);
	});

	it('should get alert group', async () => {
		const orgId = 'orgId';
		const unitId = 'unitId';
		const mockAlertGroupViewModel = new AlertGroupViewModel();
		mockAlertGroupViewModel.name = 'somename';
		mockQueryBus.execute.mockResolvedValueOnce(mockAlertGroupViewModel);

		const result = await resolver.alertGroup(
			{ organizationId: orgId } as AuthUser,
			{ id: unitId } as UnitViewModel,
		);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetAlertGroupByUnitIdQuery(orgId, unitId),
		);
		expect(result).toEqual(mockAlertGroupViewModel);
	});
});

describe('AlertGroupAssignmentResolver', () => {
	let resolver: AlertGroupAssignmentResolver;
	const mockQueryBus = createMock<QueryBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AlertGroupAssignmentResolver,
				{ provide: QueryBus, useValue: mockQueryBus },
			],
		}).compile();

		resolver = module.get<AlertGroupAssignmentResolver>(
			AlertGroupAssignmentResolver,
		);
	});

	it('should get assignment', async () => {
		const orgId = 'orgId';
		const alertGroupId = 'alertGroupId';
		const mockEntityRescueStationAssignment =
			new EntityRescueStationAssignment();
		mockEntityRescueStationAssignment.note = 'somenote';
		mockQueryBus.execute.mockResolvedValueOnce(
			mockEntityRescueStationAssignment,
		);

		const result = await resolver.assignment(
			{ organizationId: orgId } as AuthUser,
			{ id: alertGroupId } as AlertGroupViewModel,
		);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetDeployableEntityAssignment(orgId, alertGroupId),
		);
		expect(result).toEqual(mockEntityRescueStationAssignment);
	});
});
