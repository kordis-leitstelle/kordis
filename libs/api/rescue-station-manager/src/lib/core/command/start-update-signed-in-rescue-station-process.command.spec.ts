import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateSignedInRescueStationCommand } from '@kordis/api/deployment';
import { AuthUser } from '@kordis/shared/model';

import { SignedInRescueStationUpdatedEvent } from '../event/signed-in-rescue-station-updated.event';
import { MessageCommandRescueStationDetailsFactory } from './message-command-rescue-station-details.factory';
import {
	StartUpdateSignedInRescueStationProcessCommand,
	StartUpdateSignedInRescueStationProcessHandler,
} from './start-update-signed-in-rescue-station-process.command';

const COMMAND = new StartUpdateSignedInRescueStationProcessCommand(
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

describe('StartUpdateSignedInRescueStationProcessHandler', () => {
	let handler: StartUpdateSignedInRescueStationProcessHandler;
	let commandBus: CommandBus;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				{
					provide: MessageCommandRescueStationDetailsFactory,
					useValue: createMock<MessageCommandRescueStationDetailsFactory>(),
				},
				StartUpdateSignedInRescueStationProcessHandler,
			],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.compile();

		handler = module.get<StartUpdateSignedInRescueStationProcessHandler>(
			StartUpdateSignedInRescueStationProcessHandler,
		);
		commandBus = module.get<CommandBus>(CommandBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	it('should fire UpdateSignedInRescueStationCommand', async () => {
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
