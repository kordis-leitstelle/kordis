import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import DataLoader from 'dataloader';

import {
	DataLoaderContextProvider,
	GraphQLSubscriptionService,
} from '@kordis/api/shared';
import { UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../../core/entity/rescue-station-deployment.entity';
import { RescueStationsResetEvent } from '../../core/event/rescue-stations-reset.event';
import { GetRescueStationDeploymentsQuery } from '../../core/query/get-rescue-station-deployments.query';
import { RescueStationEntityDTO } from '../../core/repository/rescue-station-deployment.repository';
import { RescueStationDtoMapperProfile } from '../mapper/rescue-station-dto.mapper-profile';
import { RescueStationDeploymentViewModel } from '../view-model/rescue-station.view-model';
import { DeploymentUnitResolver } from './deployment-unit.resolver';
import {
	RescueStationDeploymentDefaultUnitsResolver,
	RescueStationDeploymentResolver,
} from './rescue-station-deployment.resolver';
import { RescueStationFilterArgs } from './rescue-station-filter.args';

const getMockDeployment1 = () => {
	const deploymentResult = new RescueStationDeploymentEntity();
	deploymentResult.note = 'somenote';
	const deploymentUnit1 = new DeploymentUnit();
	deploymentUnit1.unit = { id: 'deploymentUnitId1' };
	deploymentResult.assignedUnits = [deploymentUnit1];
	const deploymentAlertGroup1 = new DeploymentAlertGroup();
	deploymentAlertGroup1.alertGroup = { id: 'deploymentAlertGroupId1' };
	const deploymentUnit3 = new DeploymentUnit();
	deploymentUnit3.unit = { id: 'deploymentUnitId3' };
	deploymentAlertGroup1.assignedUnits = [deploymentUnit3];
	deploymentResult.assignedAlertGroups = [deploymentAlertGroup1];
	return deploymentResult;
};
const getMockDeployment2 = () => {
	const deploymentResult = new RescueStationDeploymentEntity();
	deploymentResult.note = 'someothernote';
	const deploymentUnit2 = new DeploymentUnit();
	deploymentUnit2.unit = { id: 'deploymentUnitId2' };
	deploymentResult.assignedUnits = [deploymentUnit2];
	const deploymentAlertGroup2 = new DeploymentAlertGroup();
	deploymentAlertGroup2.alertGroup = { id: 'deploymentAlertGroupId2' };
	const deploymentUnit4 = new DeploymentUnit();
	deploymentUnit4.unit = { id: 'deploymentUnitId4' };
	deploymentAlertGroup2.assignedUnits = [deploymentUnit4];
	deploymentResult.assignedAlertGroups = [deploymentAlertGroup2];
	return deploymentResult;
};

describe('RescueStationDeploymentResolver', () => {
	let resolver: RescueStationDeploymentResolver;
	const mockQueryBus = createMock<QueryBus>();
	const mockCommandBus = createMock<CommandBus>();
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
				CqrsModule,
			],
			providers: [
				RescueStationDeploymentResolver,
				RescueStationDtoMapperProfile,
				GraphQLSubscriptionService,
			],
		})
			.overrideProvider(QueryBus)
			.useValue(mockQueryBus)
			.overrideProvider(CommandBus)
			.useValue(mockCommandBus)
			.compile();

		eventBus = module.get<EventBus>(EventBus);
		resolver = module.get<RescueStationDeploymentResolver>(
			RescueStationDeploymentResolver,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should find rescue station deployments by orgId', async () => {
		const orgId = 'orgId';
		const filter = new RescueStationFilterArgs();
		filter.signedIn = true;

		mockQueryBus.execute.mockResolvedValueOnce([
			getMockDeployment1(),
			getMockDeployment2(),
		]);

		const result = await resolver.rescueStationDeployments(
			{ organizationId: orgId } as AuthUser,
			filter,
		);
		const filterDto = new RescueStationEntityDTO();
		filterDto.signedIn = true;
		expect(mockQueryBus.execute).toHaveBeenCalledWith(
			new GetRescueStationDeploymentsQuery(orgId, filterDto),
		);

		expect(result.length).toBe(2);
		expect(result[0].note).toBe('somenote');
		expect(result[1].note).toBe('someothernote');
	});

	it('should resolve assignments of rescue station deployment', async () => {
		const result = await resolver.assignments(getMockDeployment1());

		expect(result).toEqual([
			{
				unit: { id: 'deploymentUnitId1' },
			},
			{
				alertGroup: { id: 'deploymentAlertGroupId1' },
				assignedUnits: [{ unit: { id: 'deploymentUnitId3' } }],
			},
		]);
	});

	it('should emit subscription on RescueStationsResetEvent', async () => {
		const iterator = resolver.rescueStationsReset({
			organizationId: 'orgId',
		} as AuthUser);

		eventBus.publish(new RescueStationsResetEvent('orgId'));
		const result = await iterator.next();

		expect(result.value.rescueStationsReset).toBeTruthy();
		expect(result.done).toBeFalsy();
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
