import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToClass, plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import {
	RegisteredUnit,
	UnknownUnit,
} from '../../entity/partials/unit-partial.entity';
import {
	RescueStationSignOffMessage,
	RescueStationSignOffMessagePayload,
} from '../../entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { ProtocolEntryRepository } from '../../repository/protocol-entry.repository';
import {
	CreateRescueStationSignOffMessageCommand,
	CreateRescueStationSignOffMessageHandler,
} from './create-rescue-station-sign-off-message.command';

describe('CreateRescueStationSignOffMessageHandler', () => {
	let mockRepository: DeepMocked<ProtocolEntryRepository>;
	let handler: CreateRescueStationSignOffMessageHandler;

	let mockEventBus: DeepMocked<EventBus>;

	beforeEach(async () => {
		mockEventBus = createMock<EventBus>();
		mockRepository = createMock<ProtocolEntryRepository>();
		handler = new CreateRescueStationSignOffMessageHandler(
			mockRepository,
			mockEventBus,
		);
	});

	it('should create a message and publish an event', async () => {
		const sendingTime = new Date();
		const expectedMessage = plainToInstance(RescueStationSignOffMessage, {
			orgId: 'organizationId',
			time: sendingTime,
			communicationDetails: {
				sender: plainToInstance(RegisteredUnit, {
					unit: { id: 'knownSenderUnit' },
				}),
				recipient: plainToInstance(UnknownUnit, {
					name: 'unknownReceivingUnit',
				}),
				channel: 'channel',
			},
			producer: plainToInstance(UserProducer, {
				userId: 'userId',
				firstName: 'firstName',
				lastName: 'lastName',
			}),
			payload: plainToClass(RescueStationSignOffMessagePayload, {
				rescueStationId: '67d5cd788589e9f157b9cd0f',
				rescueStationName: 'rescueStationName',
				rescueStationCallSign: 'rescueStationCallSign',
			}),
			referenceId: '67d5cd788589e9f157b9cd0f',
			searchableText: `ausmeldung rettungswache rescueStationName rescueStationCallSign`,
		});
		(expectedMessage as any).createdAt = expect.any(Date);

		mockRepository.create.mockResolvedValueOnce(expectedMessage);

		await handler.execute(
			new CreateRescueStationSignOffMessageCommand(
				sendingTime,
				{
					sender: plainToInstance(RegisteredUnit, {
						unit: { id: 'knownSenderUnit' },
					}),
					recipient: plainToInstance(UnknownUnit, {
						name: 'unknownReceivingUnit',
					}),
					channel: 'channel',
				},
				{
					id: '67d5cd788589e9f157b9cd0f',
					name: 'rescueStationName',
					callSign: 'rescueStationCallSign',
				},
				{
					id: 'userId',
					organizationId: 'organizationId',
					firstName: 'firstName',
					lastName: 'lastName',
				} as AuthUser,
			),
		);

		expect(mockRepository.create).toHaveBeenCalledWith(expectedMessage);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			expect.objectContaining({
				protocolEntry: expectedMessage,
			}),
		);
	});
});
