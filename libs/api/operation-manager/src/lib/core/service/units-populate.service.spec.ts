import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { UnitsPopulateService } from './units-populate.service';

describe('UnitsPopulateService', () => {
	let service: UnitsPopulateService;
	let queryBusMock: DeepMocked<QueryBus>;

	beforeEach(async () => {
		queryBusMock = createMock<QueryBus>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitsPopulateService,
				{ provide: QueryBus, useValue: queryBusMock },
			],
		}).compile();

		service = module.get<UnitsPopulateService>(UnitsPopulateService);
	});

	it('should populate units and alert groups correctly', async () => {
		const unitIds = ['unitId1', 'unitId2'];
		const alertGroups = [
			{
				alertGroupId: 'alertGroupId1',
				assignedUnitIds: ['unitId3', 'unitId4'],
			},
		];

		const units = [
			{ id: 'unitId1', name: 'Unit 1', callSign: 'U1' },
			{ id: 'unitId2', name: 'Unit 2', callSign: 'U2' },
			{ id: 'unitId3', name: 'Unit 3', callSign: 'U3' },
			{ id: 'unitId4', name: 'Unit 4', callSign: 'U4' },
		];

		const alertGroupsViewModel = [
			{ id: 'alertGroupId1', name: 'Alert Group 1' },
		];

		queryBusMock.execute
			.mockResolvedValueOnce(units)
			.mockResolvedValueOnce(alertGroupsViewModel);

		const result = await service.getPopulatedUnitsAndAlertGroups(
			unitIds,
			alertGroups,
		);

		expect(result).toEqual({
			assignedUnits: [
				{ id: 'unitId1', name: 'Unit 1', callSign: 'U1' },
				{ id: 'unitId2', name: 'Unit 2', callSign: 'U2' },
			],
			assignedAlertGroups: [
				{
					id: 'alertGroupId1',
					name: 'Alert Group 1',
					assignedUnits: [
						{ id: 'unitId3', name: 'Unit 3', callSign: 'U3' },
						{ id: 'unitId4', name: 'Unit 4', callSign: 'U4' },
					],
				},
			],
		});
	});
});
