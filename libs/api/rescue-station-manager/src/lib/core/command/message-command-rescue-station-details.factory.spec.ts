import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { MessageCommandRescueStationDetails } from '@kordis/api/protocol';

import { CommandRescueStationData } from './command-rescue-station-data.model';
import { MessageCommandRescueStationDetailsFactory } from './message-command-rescue-station-details.factory';

describe('MessageCommandRescueStationDetailsFactory', () => {
	let factory: MessageCommandRescueStationDetailsFactory;
	let mockQueryBus: DeepMocked<QueryBus>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MessageCommandRescueStationDetailsFactory,
				{ provide: QueryBus, useValue: createMock<QueryBus>() },
			],
		}).compile();

		factory = module.get<MessageCommandRescueStationDetailsFactory>(
			MessageCommandRescueStationDetailsFactory,
		);
		mockQueryBus = module.get<DeepMocked<QueryBus>>(QueryBus);
	});

	it('should create MessageCommandRescueStationDetails from CommandRescueStationData', async () => {
		const orgId = 'orgId';
		const commandRescueStationData: CommandRescueStationData = {
			rescueStationId: 'rescueStationId',
			assignedAlertGroups: [
				{
					alertGroupId: 'alertGroupId1',
					unitIds: ['unitId2'],
				},
				{
					alertGroupId: 'alertGroupId2',
					unitIds: ['unitId3', 'unitId4'],
				},
			],
			assignedUnitIds: ['unitId1'],
			note: 'note',
			strength: {
				leaders: 1,
				subLeaders: 1,
				helpers: 1,
			},
		};

		mockQueryBus.execute.mockResolvedValueOnce({
			id: 'rescueStationId',
			callSign: 'callSign',
			name: 'name',
		});
		mockQueryBus.execute.mockResolvedValueOnce([
			{
				id: 'unitId1',
				name: 'unitName1',
				callSign: 'unitCallSign1',
			},
			{
				id: 'unitId2',
				name: 'unitName2',
				callSign: 'unitCallSign2',
			},
			{
				id: 'unitId3',
				name: 'unitName3',
				callSign: 'unitCallSign3',
			},
			{
				id: 'unitId4',
				name: 'unitName4',
				callSign: 'unitCallSign4',
			},
		]);
		mockQueryBus.execute.mockResolvedValueOnce([
			{
				id: 'alertGroupId1',
				name: 'alertGroupName1',
			},
			{
				id: 'alertGroupId2',
				name: 'alertGroupName2',
			},
		]);

		const result = await factory.createFromCommandRescueStationData(
			orgId,
			commandRescueStationData,
		);

		const expected: MessageCommandRescueStationDetails = {
			units: [
				{
					id: 'unitId1',
					name: 'unitName1',
					callSign: 'unitCallSign1',
				},
			],
			alertGroups: [
				{
					id: 'alertGroupId1',
					name: 'alertGroupName1',
					units: [
						{
							id: 'unitId2',
							name: 'unitName2',
							callSign: 'unitCallSign2',
						},
					],
				},
				{
					id: 'alertGroupId2',
					name: 'alertGroupName2',
					units: [
						{
							id: 'unitId3',
							name: 'unitName3',
							callSign: 'unitCallSign3',
						},
						{
							id: 'unitId4',
							name: 'unitName4',
							callSign: 'unitCallSign4',
						},
					],
				},
			],
			name: 'name',
			callSign: 'callSign',
			id: 'rescueStationId',
			strength: commandRescueStationData.strength,
		};

		expect(result).toEqual(expected);
	});
});
