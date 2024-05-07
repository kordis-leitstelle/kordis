import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { SignOffRescueStationCommand } from '@kordis/api/deployment';

import { RescueStationSignedOffEvent } from '../event/rescue-station-signed-off.event';
import {
	StartSignOffProcessCommand,
	StartSignOffProcessHandler,
} from './start-sign-off-process.command';

describe('StartSignOffProcessCommand', () => {
	let handler: StartSignOffProcessHandler;
	let commandBus: CommandBus;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [StartSignOffProcessHandler],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.compile();

		handler = module.get<StartSignOffProcessHandler>(
			StartSignOffProcessHandler,
		);
		commandBus = module.get<CommandBus>(CommandBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	it('should fire StartSignOffProcessCommand', async () => {
		const command = new StartSignOffProcessCommand('orgId', 'rescueStationId');

		await handler.execute(command);

		expect(commandBus.execute).toHaveBeenCalledWith(
			new SignOffRescueStationCommand('orgId', 'rescueStationId'),
		);
	});

	it('should RescueStationSignedOffEvent event after station signed off', async () => {
		const command = new StartSignOffProcessCommand('orgId', 'rescueStationId');

		return new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toEqual(
					new RescueStationSignedOffEvent('orgId', 'rescueStationId'),
				);
				done();
			});

			handler.execute(command);
		});
	});
});
