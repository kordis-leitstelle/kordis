import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateSignedInRescueStationCommand } from '@kordis/api/deployment';
import { CreateRescueStationSignOnMessageCommand } from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { SignedInRescueStationUpdatedEvent } from '../event/signed-in-rescue-station-updated.event';
import {
	LaunchUpdateSignedInRescueStationProcessCommand,
	LaunchUpdateSignedInRescueStationProcessHandler,
} from './launch-update-signed-in-rescue-station-process.command';
import { RescueStationMessageDetailsFactory } from './rescue-station-message-details-factory.service';

const COMMAND = new LaunchUpdateSignedInRescueStationProcessCommand(
	{
		organizationId: 'orgId',
	} as AuthUser,
	{
		rescueStationId: 'rescueStationId',
		assignedAlertGroups: [
			{
				alertGroupId: 'alertGroupId',
				unitIds: ['unitId1'],
			},
		],
		assignedUnitIds: ['unitId2'],
		note: 'note',
		strength: {
			leaders: 1,
			subLeaders: 1,
			helpers: 1,
		},
	},
	{
		sender: {
			name: 'senderName',
		},
		recipient: {
			unit: { id: 'unitId' },
		},
		channel: 'channel',
	},
);

describe('LaunchUpdateSignedInRescueStationProcessHandler', () => {
	let handler: LaunchUpdateSignedInRescueStationProcessHandler;
	let commandBus: CommandBus;
	let eventBus: EventBus;
	let factory: DeepMocked<RescueStationMessageDetailsFactory>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				{
					provide: RescueStationMessageDetailsFactory,
					useValue: createMock<RescueStationMessageDetailsFactory>(),
				},
				LaunchUpdateSignedInRescueStationProcessHandler,
			],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.compile();

		handler = module.get<LaunchUpdateSignedInRescueStationProcessHandler>(
			LaunchUpdateSignedInRescueStationProcessHandler,
		);
		commandBus = module.get<CommandBus>(CommandBus);
		eventBus = module.get<EventBus>(EventBus);
		factory = module.get<DeepMocked<RescueStationMessageDetailsFactory>>(
			RescueStationMessageDetailsFactory,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should fire UpdateSignedInRescueStationCommand and CreateRescueStationSignOnMessageCommand', async () => {
		const rsDetails = {
			id: 'mockId',
			name: 'Mock Station Name',
			callSign: 'MockCallSign',
			strength: {
				leaders: 2,
				subLeaders: 1,
				helpers: 3,
			},
			units: [
				{
					id: 'unitId2',
					name: 'Unit Name 2',
					callSign: 'UnitCallSign2',
				},
			],
			alertGroups: [
				{
					id: 'alertGroupId1',
					name: 'Alert Group Name 1',
					units: [
						{
							id: 'unitId1',
							name: 'Unit Name 1',
							callSign: 'UnitCallSign1',
						},
					],
				},
			],
		};
		factory.createFromCommandRescueStationData.mockResolvedValue(rsDetails);

		await handler.execute(COMMAND);

		expect(commandBus.execute).toHaveBeenCalledWith(
			new UpdateSignedInRescueStationCommand(
				'orgId',
				'rescueStationId',
				{
					leaders: 1,
					subLeaders: 1,
					helpers: 1,
				},
				'note',
				['unitId2'],
				[
					{
						alertGroupId: 'alertGroupId',
						unitIds: ['unitId1'],
					},
				],
			),
		);

		expect(commandBus.execute).toHaveBeenCalledWith(
			new CreateRescueStationSignOnMessageCommand(
				expect.any(Date),
				{
					sender: { name: 'senderName' },
					recipient: { unit: { id: 'unitId' } },
					channel: 'channel',
				},
				rsDetails,
				{ organizationId: 'orgId' } as AuthUser,
			),
		);
	});

	it('should not fire CreateRescueStationSignOnMessageCommand if communicationMessageData is null', async () => {
		await handler.execute(
			new LaunchUpdateSignedInRescueStationProcessCommand(
				{} as any,
				{} as any,
				null,
			),
		);
		expect(commandBus.execute).not.toHaveBeenCalledWith(
			expect.any(CreateRescueStationSignOnMessageCommand),
		);
	});

	it('should publish SignedInRescueStationUpdatedEvent after station update', async () => {
		return new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toEqual(
					new SignedInRescueStationUpdatedEvent('orgId', 'rescueStationId'),
				);
				done();
			});

			handler.execute(COMMAND);
		});
	});
});
