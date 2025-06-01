import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { SignOffRescueStationCommand } from '@kordis/api/deployment';
import { CreateRescueStationSignOffMessageCommand } from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedOffEvent } from '../event/rescue-station-signed-off.event';
import {
	LaunchSignOffProcessCommand,
	LaunchSignOffProcessHandler,
} from './launch-sign-off-process.command';

describe('LaunchSignOffProcessCommand', () => {
	let handler: LaunchSignOffProcessHandler;
	let commandBus: CommandBus;
	let mockQueryBus: DeepMocked<QueryBus>;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [LaunchSignOffProcessHandler],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		handler = module.get<LaunchSignOffProcessHandler>(
			LaunchSignOffProcessHandler,
		);
		commandBus = module.get<CommandBus>(CommandBus);
		mockQueryBus = module.get<DeepMocked<QueryBus>>(QueryBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should fire StartSignOffProcessCommand and CreateRescueStationSignOffMessageCommand', async () => {
		const command = new LaunchSignOffProcessCommand(
			{
				organizationId: 'orgId',
			} as AuthUser,
			'rescueStationId',
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

		mockQueryBus.execute.mockResolvedValueOnce({
			id: 'rescueStationId',
			name: 'rescueStationName',
			callSign: 'rescueStationCallSign',
		});

		await handler.execute(command);

		expect(commandBus.execute).toHaveBeenCalledWith(
			new CreateRescueStationSignOffMessageCommand(
				expect.any(Date),
				{
					sender: {
						name: 'senderName',
					},
					recipient: {
						unit: { id: 'unitId' },
					},
					channel: 'channel',
				},
				{
					id: 'rescueStationId',
					name: 'rescueStationName',
					callSign: 'rescueStationCallSign',
				},
				{
					organizationId: 'orgId',
				} as AuthUser,
			),
		);
		expect(commandBus.execute).toHaveBeenCalledWith(
			new SignOffRescueStationCommand('orgId', 'rescueStationId'),
		);
	});

	it('should RescueStationSignedOffEvent event after station signed off', async () => {
		const command = new LaunchSignOffProcessCommand(
			{
				organizationId: 'orgId',
			} as AuthUser,
			'rescueStationId',
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
