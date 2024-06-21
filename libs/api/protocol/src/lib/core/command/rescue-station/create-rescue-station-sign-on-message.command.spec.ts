import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToClass, plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import {
	RegisteredUnit,
	UnknownUnit,
} from '../../entity/partials/unit-partial.entity';
import { RescueStationMessagePayload } from '../../entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOnMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { ProtocolEntryRepository } from '../../repository/protocol-entry.repository';
import { RescueStationMessageFactory } from '../helper/rescue-station-message.factory';
import {
	CreateRescueStationSignOnMessageCommand,
	CreateRescueStationSignOnMessageHandler,
} from './create-rescue-station-sign-on-message.command';

describe('CreateRescueStationSignOnMessageHandler', () => {
	let mockRepository: DeepMocked<ProtocolEntryRepository>;
	let handler: CreateRescueStationSignOnMessageHandler;
	let mockEventBus: DeepMocked<EventBus>;

	beforeEach(async () => {
		mockEventBus = createMock<EventBus>();
		mockRepository = createMock<ProtocolEntryRepository>();

		handler = new CreateRescueStationSignOnMessageHandler(
			mockRepository,
			mockEventBus,
			new RescueStationMessageFactory(),
		);
	});

	it('should create a message and publish an event', async () => {
		const sendingTime = new Date();
		const expectedMessage = plainToInstance(RescueStationSignOnMessage, {
			orgId: 'organizationId',
			time: sendingTime,
			sender: plainToInstance(RegisteredUnit, {
				unit: { id: 'knownSenderUnit' },
			}),
			recipient: plainToInstance(UnknownUnit, { name: 'unknownReceivingUnit' }),
			channel: 'channel',
			producer: plainToInstance(UserProducer, {
				userId: 'userId',
				firstName: 'firstName',
				lastName: 'lastName',
			}),
			payload: plainToClass(RescueStationMessagePayload, {
				rescueStationId: 'rescueStationId',
				rescueStationName: 'rescueStationName',
				rescueStationCallSign: 'rescueStationCallSign',
				strength: {
					leaders: 1,
					subLeaders: 1,
					helpers: 1,
				},
				units: [
					{ name: 'unitName1', callSign: 'unitCallSign1', id: 'unitId1' },
				],
				alertGroups: [
					{
						id: 'alertGroupId',
						name: 'alertGroupName',
						units: [
							{ name: 'unitName2', callSign: 'unitCallSign2', id: 'unitId2' },
						],
					},
				],
			}),
			searchableText: `anmeldung rettungswache rescueStationName rescueStationCallSign stärke 1/1/1/3 einheiten unitName1 unitCallSign1 alarmgruppen alertGroupName unitName2 unitCallSign2`,
		});
		(expectedMessage as any).createdAt = expect.any(Date);

		mockRepository.create.mockResolvedValueOnce(expectedMessage);

		const res = await handler.execute(
			new CreateRescueStationSignOnMessageCommand(
				sendingTime,
				plainToInstance(RegisteredUnit, {
					unit: { id: 'knownSenderUnit' },
				}),
				plainToInstance(UnknownUnit, {
					name: 'unknownReceivingUnit',
				}),
				{
					id: 'rescueStationId',
					name: 'rescueStationName',
					callSign: 'rescueStationCallSign',
					strength: {
						leaders: 1,
						subLeaders: 1,
						helpers: 1,
					},
					units: [
						{ name: 'unitName1', callSign: 'unitCallSign1', id: 'unitId1' },
					],
					alertGroups: [
						{
							id: 'alertGroupId',
							name: 'alertGroupName',
							units: [
								{ name: 'unitName2', callSign: 'unitCallSign2', id: 'unitId2' },
							],
						},
					],
				},
				'channel',
				{
					id: 'userId',
					organizationId: 'organizationId',
					firstName: 'firstName',
					lastName: 'lastName',
				} as AuthUser,
			),
		);

		expect(mockRepository.create).toHaveBeenCalledWith(expectedMessage);
		expect(res).toEqual(expectedMessage);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			expect.objectContaining({
				protocolEntry: expectedMessage,
			}),
		);
	});
});
