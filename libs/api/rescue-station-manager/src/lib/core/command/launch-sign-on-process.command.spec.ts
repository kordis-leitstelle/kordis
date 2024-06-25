import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { SignInRescueStationCommand } from '@kordis/api/deployment';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedOnEvent } from '../event/rescue-station-signed-on.event';
import {
	LaunchSignOnProcessCommand,
	LaunchSignOnProcessHandler,
} from './launch-sign-on-process.command';
import { MessageCommandRescueStationDetailsFactory } from './message-command-rescue-station-details.factory';

const COMMAND = new LaunchSignOnProcessCommand(
	{
		organizationId: 'orgId',
	} as AuthUser,
	{
		rescueStationId: 'stationId',
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

describe('LaunchSignOnProcessHandler', () => {
	let handler: LaunchSignOnProcessHandler;
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
				LaunchSignOnProcessHandler,
			],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.compile();

		handler = module.get<LaunchSignOnProcessHandler>(
			LaunchSignOnProcessHandler,
		);
		commandBus = module.get<CommandBus>(CommandBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	it('should fire SignOnRescueStationCommand', async () => {
		await handler.execute(COMMAND);

		expect(commandBus.execute).toHaveBeenCalledWith(
			new SignInRescueStationCommand(
				COMMAND.reqUser.organizationId,
				COMMAND.rescueStationData.rescueStationId,
				COMMAND.rescueStationData.strength,
				COMMAND.rescueStationData.note,
				COMMAND.rescueStationData.assignedUnitIds,
				COMMAND.rescueStationData.assignedAlertGroups,
			),
		);
	});

	it('should RescueStationSignedOnEvent event after station signing on', async () => {
		return new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toEqual(
					new RescueStationSignedOnEvent(
						COMMAND.reqUser.organizationId,
						COMMAND.rescueStationData.rescueStationId,
					),
				);
				done();
			});

			handler.execute(COMMAND);
		});
	});
});
