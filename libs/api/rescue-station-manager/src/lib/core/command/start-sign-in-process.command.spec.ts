import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { SignInRescueStationCommand } from '@kordis/api/deployment';

import { RescueStationSignedInEvent } from '../event/rescue-station-signed-in.event';
import {
	StartSignInProcessCommand,
	StartSignInProcessHandler,
} from './start-sign-in-process.command';

describe('StartSignInProcessHandler', () => {
	let handler: StartSignInProcessHandler;
	let commandBus: CommandBus;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [StartSignInProcessHandler],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.compile();

		handler = module.get<StartSignInProcessHandler>(StartSignInProcessHandler);
		commandBus = module.get<CommandBus>(CommandBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	it('should fire SignInRescueStationCommand', async () => {
		const command = new StartSignInProcessCommand('orgId', {
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
		});

		await handler.execute(command);

		expect(commandBus.execute).toHaveBeenCalledWith(
			new SignInRescueStationCommand(
				command.orgId,
				command.rescueStationData.rescueStationId,
				command.rescueStationData.strength,
				command.rescueStationData.note,
				command.rescueStationData.assignedUnitIds,
				command.rescueStationData.assignedAlertGroups,
			),
		);
	});

	it('should RescueStationSignedInEvent event after station signing in', async () => {
		const command = new StartSignInProcessCommand('orgId', {
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
		});

		return new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toEqual(
					new RescueStationSignedInEvent(
						command.orgId,
						command.rescueStationData.rescueStationId,
					),
				);
				done();
			});

			handler.execute(command);
		});
	});
});
