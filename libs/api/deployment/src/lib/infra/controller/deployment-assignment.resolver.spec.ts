import { createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { GetAlertGroupByUnitIdQuery } from '../../core/query/get-alert-group-by-unit-id.query';
import { GetCurrentAssignmentOfEntity } from '../../core/query/get-current-assignment-of-entity.query';
import { GetUnassignedEntitiesQuery } from '../../core/query/get-unassigned-entities.query';
import {
	AlertGroupAssignmentResolver,
	EntityRescueStationAssignment,
	UnassignedEntitiesResolver,
	UnitAssignmentResolver,
} from './deployment-assignment.resolver';

describe('UnassignedEntitiesResolver', () => {
	let resolver: UnassignedEntitiesResolver;
	const mockQueryBus = createMock<QueryBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnassignedEntitiesResolver,
				{ provide: QueryBus, useValue: mockQueryBus },
			],
		}).compile();

		resolver = module.get<UnassignedEntitiesResolver>(
			UnassignedEntitiesResolver,
		);
	});

	it('should get unassigned entities by orgId', async () => {
		const orgId = 'orgId';

		const mockDeploymentUnit = new DeploymentUnit();
		(mockDeploymentUnit as any).id = 'unitDeploymentId';
		const mockDeploymentAlertGroup = new DeploymentAlertGroup();
		(mockDeploymentAlertGroup as any).id = 'alertGroupDeploymentId';

		mockQueryBus.execute.mockResolvedValue([
			mockDeploymentUnit,
			mockDeploymentAlertGroup,
		]);

		const result = await resolver.unassignedEntities({
			organizationId: orgId,
		} as AuthUser);

		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetUnassignedEntitiesQuery(orgId),
		);
		expect(result).toEqual([mockDeploymentUnit, mockDeploymentAlertGroup]);
	});
});

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
			new GetCurrentAssignmentOfEntity(orgId, unitId),
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
			new GetCurrentAssignmentOfEntity(orgId, alertGroupId),
		);
		expect(result).toEqual(mockEntityRescueStationAssignment);
	});
});
