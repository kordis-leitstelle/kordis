import { plainToClass, plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import {
	RegisteredUnit,
	UnknownUnit,
} from '../../entity/partials/unit-partial.entity';
import { RescueStationMessagePayload } from '../../entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOnMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { CreateRescueStationSignOnMessageCommand } from '../rescue-station/create-rescue-station-sign-on-message.command';
import { CreateRescueStationUpdateMessageCommand } from '../rescue-station/create-rescue-station-update-message.command';
import { RescueStationMessageFactory } from './rescue-station-message.factory';

const RESCUE_STATION_DETAILS = Object.freeze({
	id: 'rescueStationId',
	name: 'rescueStationName',
	callSign: 'rescueStationCallSign',
	strength: {
		leaders: 1,
		subLeaders: 1,
		helpers: 1,
	},
	units: [{ name: 'unitName1', callSign: 'unitCallSign1', id: 'unitId1' }],
	alertGroups: [
		{
			id: 'alertGroupId',
			name: 'alertGroupName',
			units: [{ name: 'unitName2', callSign: 'unitCallSign2', id: 'unitId2' }],
		},
	],
});
const AUTH_USER = Object.freeze({
	id: 'userId',
	organizationId: 'organizationId',
	firstName: 'firstName',
	lastName: 'lastName',
} as AuthUser);
const SENDING_TIME = new Date();
const MESSAGE = Object.freeze({
	orgId: 'organizationId',
	time: SENDING_TIME,
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
		units: [{ name: 'unitName1', callSign: 'unitCallSign1', id: 'unitId1' }],
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
});

describe('RescueStationMessageFactory', () => {
	let factory: RescueStationMessageFactory;

	beforeEach(() => {
		factory = new RescueStationMessageFactory();
	});

	it('should create RescueStationSignOnMessage from command', async () => {
		const command = new CreateRescueStationSignOnMessageCommand(
			SENDING_TIME,
			{ unit: { id: 'knownSenderUnit' } },
			{ name: 'unknownReceivingUnit' },
			RESCUE_STATION_DETAILS,
			'channel',
			AUTH_USER,
		);

		const message = await factory.createSignOnMessageFromCommand(command);
		const expectedMessage = plainToInstance(
			RescueStationSignOnMessage,
			MESSAGE,
		);
		(expectedMessage as any).createdAt = expect.any(Date);
		expectedMessage.searchableText =
			'anmeldung rettungswache rescueStationName rescueStationCallSign stärke 1/1/1/3 einheiten unitName1 unitCallSign1 alarmgruppen alertGroupName unitName2 unitCallSign2';
		expect(message).toEqual(expectedMessage);
	});

	it('should create RescueStationUpdateMessage from command', async () => {
		const command = new CreateRescueStationUpdateMessageCommand(
			SENDING_TIME,
			{ unit: { id: 'knownSenderUnit' } },
			{ name: 'unknownReceivingUnit' },
			RESCUE_STATION_DETAILS,
			'channel',
			AUTH_USER,
		);

		const message = await factory.createUpdateMessageFromCommand(command);
		const expectedMessage = plainToInstance(
			RescueStationUpdateMessage,
			MESSAGE,
		);
		(expectedMessage as any).createdAt = expect.any(Date);
		expectedMessage.searchableText =
			'nachmeldung rettungswache rescueStationName rescueStationCallSign stärke 1/1/1/3 einheiten unitName1 unitCallSign1 alarmgruppen alertGroupName unitName2 unitCallSign2';
		expect(message).toEqual(expectedMessage);
	});
});
