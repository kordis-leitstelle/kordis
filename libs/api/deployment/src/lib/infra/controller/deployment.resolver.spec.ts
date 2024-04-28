import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import DataLoader from 'dataloader';

import { DataLoaderContextProvider } from '@kordis/api/shared';
import { UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../../core/entity/rescue-station-deployment.entity';
import { GetDeploymentsQuery } from '../../core/query/get-deployments.query';
import { GetUnassignedEntitiesQuery } from '../../core/query/get-unassigned-entities.query';
import { RescueStationEntityDTO } from '../../core/repository/rescue-station-deployment.repository';
import { RescueStationDtoMapperProfile } from '../mapper/rescue-station-dto.mapper-profile';
import { RescueStationViewModelProfile } from '../mapper/rescue-station-view-model.mapper';
import { RescueStationDeploymentViewModel } from '../rescue-station.view-model';
import {
	DeploymentResolver,
	DeploymentUnitResolver,
	RescueStationDeploymentDefaultUnitsResolver,
} from './deployment.resolver';
import { RescueStationFilterArgs } from './rescue-station-filter.args';

describe('DeploymentResolver', () => {
	let resolver: DeploymentResolver;
	const mockQueryBus = createMock<QueryBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				DeploymentResolver,
				RescueStationDtoMapperProfile,
				RescueStationViewModelProfile,
				{ provide: QueryBus, useValue: mockQueryBus },
			],
		}).compile();

		resolver = module.get<DeploymentResolver>(DeploymentResolver);
	});

	it('should find rescue station deployments by orgId', async () => {
		const orgId = 'orgId';
		const filter = new RescueStationFilterArgs();
		filter.signedIn = true;

		const deploymentResult1 = new RescueStationDeploymentEntity();
		deploymentResult1.note = 'somenote';
		const deploymentUnit1 = new DeploymentUnit();
		deploymentUnit1.unit = { id: 'deploymentUnitId1' };
		deploymentResult1.assignedUnits = [deploymentUnit1];
		const deploymentAlertGroup1 = new DeploymentAlertGroup();
		deploymentAlertGroup1.alertGroup = { id: 'deploymentAlertGroupId1' };
		const deploymentUnit3 = new DeploymentUnit();
		deploymentUnit3.unit = { id: 'deploymentUnitId3' };
		deploymentAlertGroup1.assignedUnits = [deploymentUnit3];
		deploymentResult1.assignedAlertGroups = [deploymentAlertGroup1];

		const deploymentResult2 = new RescueStationDeploymentEntity();
		deploymentResult2.note = 'someothernote';
		const deploymentUnit2 = new DeploymentUnit();
		deploymentUnit2.unit = { id: 'deploymentUnitId2' };
		deploymentResult2.assignedUnits = [deploymentUnit2];
		const deploymentAlertGroup2 = new DeploymentAlertGroup();
		deploymentAlertGroup2.alertGroup = { id: 'deploymentAlertGroupId2' };
		const deploymentUnit4 = new DeploymentUnit();
		deploymentUnit4.unit = { id: 'deploymentUnitId4' };
		deploymentAlertGroup2.assignedUnits = [deploymentUnit4];

		deploymentResult2.assignedAlertGroups = [deploymentAlertGroup2];

		mockQueryBus.execute.mockResolvedValueOnce([
			deploymentResult1,
			deploymentResult2,
		]);

		const result = await resolver.rescueStationDeployments(
			{ organizationId: orgId } as AuthUser,
			filter,
		);
		const filterDto = new RescueStationEntityDTO();
		filterDto.signedIn = true;
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetDeploymentsQuery(orgId, filterDto),
		);

		expect(result.length).toBe(2);
		expect(result[0].note).toBe('somenote');
		expect(result[1].note).toBe('someothernote');
		expect(result[0].assignments).toEqual([
			{
				unit: { id: 'deploymentUnitId1' },
			},
			{
				alertGroup: { id: 'deploymentAlertGroupId1' },
				assignedUnits: [{ unit: { id: 'deploymentUnitId3' } }],
			},
		]);
		expect(result[1].assignments).toEqual([
			{
				unit: { id: 'deploymentUnitId2' },
			},
			{
				alertGroup: { id: 'deploymentAlertGroupId2' },
				assignedUnits: [{ unit: { id: 'deploymentUnitId4' } }],
			},
		]);
	});

	it('should find unassigned entities by orgId', async () => {
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

describe('DeploymentUnitResolver', () => {
	let resolver: DeploymentUnitResolver;
	const mockLoadersProvider = createMock<DataLoaderContextProvider>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DeploymentUnitResolver],
		}).compile();

		resolver = module.get<DeploymentUnitResolver>(DeploymentUnitResolver);
	});

	it('should load unit by id', async () => {
		const unitId = 'unitId';
		const mockUnitViewModel = new UnitViewModel();
		(mockUnitViewModel as any).id = unitId;
		const mockDataLoader = createMock<DataLoader<string, UnitViewModel>>();
		mockDataLoader.load.mockResolvedValueOnce(mockUnitViewModel);
		mockLoadersProvider.getLoader.mockReturnValueOnce(mockDataLoader);

		const deploymentUnit = new DeploymentUnit();
		deploymentUnit.unit = { id: unitId };

		const result = await resolver.unit(deploymentUnit, {
			loadersProvider: mockLoadersProvider,
		});

		expect(mockDataLoader.load).toHaveBeenCalledWith(unitId);
		expect(result).toEqual(mockUnitViewModel);
	});
});

describe('RescueStationDeploymentDefaultUnitsResolver', () => {
	let resolver: RescueStationDeploymentDefaultUnitsResolver;
	const mockLoadersProvider = createMock<DataLoaderContextProvider>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RescueStationDeploymentDefaultUnitsResolver,
				{ provide: DataLoaderContextProvider, useValue: mockLoadersProvider },
			],
		}).compile();

		resolver = module.get<RescueStationDeploymentDefaultUnitsResolver>(
			RescueStationDeploymentDefaultUnitsResolver,
		);
	});

	it('should load default units by ids', async () => {
		const unitIds = ['unitId1', 'unitId2'];
		const mockUnitViewModels = unitIds.map((id) => {
			const mockUnitViewModel = new UnitViewModel();
			(mockUnitViewModel as any).id = id;
			return mockUnitViewModel;
		});
		const mockDataLoader = createMock<DataLoader<unknown, UnitViewModel>>();
		mockDataLoader.loadMany.mockResolvedValueOnce(mockUnitViewModels);
		mockLoadersProvider.getLoader.mockReturnValueOnce(mockDataLoader);

		const rescueStationDeploymentViewModel =
			new RescueStationDeploymentViewModel();
		rescueStationDeploymentViewModel.defaultUnits = unitIds.map((id) => ({
			id,
		}));

		const result = await resolver.defaultUnits(
			rescueStationDeploymentViewModel,
			{
				loadersProvider: mockLoadersProvider,
			},
		);

		expect(mockDataLoader.loadMany).toHaveBeenCalledWith(unitIds);
		expect(result).toEqual(mockUnitViewModels);
	});
});
