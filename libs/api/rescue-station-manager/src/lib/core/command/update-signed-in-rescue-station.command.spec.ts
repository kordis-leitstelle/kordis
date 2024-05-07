import { createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateSignedInRescueStationCommand } from '@kordis/api/deployment';

import { SignedInRescueStationUpdatedEvent } from '../event/signed-in-rescue-station-updated.event';
import {
	StartUpdateSignedInRescueStationProcessCommand,
	UpdateSignedInRescueStationHandler,
} from './update-signed-in-rescue-station.command';

describe('UpdateSignedInRescueStationHandler', () => {
	let handler: UpdateSignedInRescueStationHandler;
	let commandBus: CommandBus;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [UpdateSignedInRescueStationHandler],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.compile();

		handler = module.get<UpdateSignedInRescueStationHandler>(
			UpdateSignedInRescueStationHandler,
		);
		commandBus = module.get<CommandBus>(CommandBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	it('should fire UpdateSignedInRescueStationCommand', async () => {
		const command = new StartUpdateSignedInRescueStationProcessCommand(
			'orgId',
			{
				rescueStationId: 'rescueStationId',
				assignedAlertGroups: [],
				assignedUnitIds: [],
				note: 'note',
				strength: {
					leaders: 1,
					subLeaders: 1,
					helpers: 1,
				},
			},
		);

		await handler.execute(command);

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
				[],
				[],
			),
		);
	});

	it('should publish SignedInRescueStationUpdatedEvent after station update', async () => {
		const command = new StartUpdateSignedInRescueStationProcessCommand(
			'orgId',
			{
				rescueStationId: 'rescueStationId',
				assignedAlertGroups: [],
				assignedUnitIds: [],
				note: 'note',
				strength: {
					leaders: 1,
					subLeaders: 1,
					helpers: 1,
				},
			},
		);

		return new Promise<void>((done) => {
			eventBus.subscribe((event) => {
				expect(event).toEqual(
					new SignedInRescueStationUpdatedEvent('orgId', 'rescueStationId'),
				);
				done();
			});

			handler.execute(command);
		});
	});
});
