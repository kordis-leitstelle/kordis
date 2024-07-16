import { RescueStationMessagePayload } from 'libs/api/protocol/src/lib/core/entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { ProtocolEntryType } from 'libs/api/protocol/src/lib/infra/schema/protocol-entry-type';
import { RescueStationSignOffMessageDocument } from 'libs/api/protocol/src/lib/infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { RescueStationSignOnMessageDocument } from 'libs/api/protocol/src/lib/infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageDocument } from 'libs/api/protocol/src/lib/infra/schema/rescue-station/rescue-station-updated-message.schema';
import { Types } from 'mongoose';

import { type CommunicationMessageDocument } from '../../../libs/api/protocol/src/lib/infra/schema/communication/communication-message.schema';
import {
	ProducerType,
	UserProducerDocument,
} from '../../../libs/api/protocol/src/lib/infra/schema/producer-partial.schema';
import { UnitType } from '../../../libs/api/protocol/src/lib/infra/schema/unit-partial.schema';
import { getAlertGroupIdAsStringByName } from './alert-groups.data';
import { CollectionData } from './collection-data.model';
import { getDeploymentByName } from './deployments.data';
import { getOrganizationIdAsStringByName } from './organizations.data';
import { getUserByUsername } from './test-users';
import { getUnitByName, getUnitIdAsStringByName } from './units.data';

const getUserAsProducer = (
	username: Parameters<typeof getUserByUsername>[0],
): UserProducerDocument => {
	const user = getUserByUsername(username);

	return {
		userId: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		type: ProducerType.USER_PRODUCER,
	};
};

const getRescueStationInformation = (
	rescueStationName: Parameters<typeof getDeploymentByName>[0],
) => {
	const rescueStation = getDeploymentByName(rescueStationName);
	return {
		rescueStationCallSign: rescueStation.callSign,
		rescueStationId: rescueStation._id.toString(),
		rescueStationName: rescueStation.name,
	};
};

const getRescueStationMessagePayload = (
	rescueStationName: Parameters<typeof getRescueStationInformation>[0],
	alertGroupNames: Parameters<typeof getAlertGroupIdAsStringByName>[0][],
	unitNames: Parameters<typeof getUnitByName>[0][],
	strength?: RescueStationMessagePayload['strength'],
) => {
	const alertGroups = alertGroupNames.map((alertGroupName) =>
		getAlertGroupIdAsStringByName(alertGroupName),
	);
	const units = unitNames.map((unitName) => getUnitIdAsStringByName(unitName));

	return {
		...getRescueStationInformation(rescueStationName),
		strength: strength ?? {
			leaders: 1,
			subLeaders: 2,
			helpers: 3,
		},
		alertGroups,
		units,
	} satisfies RescueStationMessagePayload;
};

const collectionData = {
	collectionName: 'protocol-entries',
	entries: [
		{
			_id: new Types.ObjectId('66846ba41af826ce7c50c3a4'),
			createdAt: new Date(),
			updatedAt: new Date(),
			channel: 'D',
			payload: { message: 'Test' },
			producer: getUserAsProducer('testuser'),
			recipient: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('MRB Greif 5'),
			},
			sender: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('ATV'),
			},
			searchableText: 'Test',
			time: new Date(),
			type: ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies CommunicationMessageDocument,
		{
			_id: new Types.ObjectId('6696c4bddfe9fcb08c639c78'),
			createdAt: new Date(),
			updatedAt: new Date(),
			channel: 'D',
			payload: getRescueStationMessagePayload(
				'DLRG Einsatzzentrale HH',
				[],
				['MRB Greif 5', 'ATV'],
			),
			producer: getUserAsProducer('testuser'),
			recipient: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('MRB Greif 5'),
			},
			sender: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('RW Wittenbergen'),
			},
			searchableText:
				'Einmeldung - DLRG Einsatzzentrale HH - MRB Greif 5, ATV - Stärke 1/2/3/6',
			time: new Date(),
			type: ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies RescueStationSignOnMessageDocument,
		{
			_id: new Types.ObjectId('6696c4c2181d71124b056e80'),
			createdAt: new Date(),
			updatedAt: new Date(),
			channel: 'D',
			payload: getRescueStationMessagePayload(
				'DLRG Einsatzzentrale HH',
				['SEG Altona'],
				['MRB Greif 5'],
				{ leaders: 1, helpers: 3, subLeaders: 6 },
			),
			producer: getUserAsProducer('testuser'),
			recipient: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('MRB Greif 5'),
			},
			sender: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('RW Wittenbergen'),
			},
			searchableText:
				'Aktualisierte Stärke - DLRG Einsatzzentrale HH - SEG Altona - MRB Greif 5 - Stärke 1/3/6/10',
			time: new Date(),
			type: ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies RescueStationUpdateMessageDocument,
		{
			_id: new Types.ObjectId('6696c4c669af565692a0f030'),
			createdAt: new Date(),
			updatedAt: new Date(),
			channel: 'D',
			payload: getRescueStationInformation('DLRG Einsatzzentrale HH'),
			producer: getUserAsProducer('testuser'),
			recipient: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('MRB Greif 5'),
			},
			sender: {
				type: UnitType.REGISTERED_UNIT,
				unitId: getUnitIdAsStringByName('RW Wittenbergen'),
			},
			searchableText: 'Ausmeldung - DLRG Einsatzzentrale HH',
			time: new Date(),
			type: ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies RescueStationSignOffMessageDocument,
	],
} as const satisfies CollectionData<
	| CommunicationMessageDocument
	| RescueStationSignOnMessageDocument
	| RescueStationSignOffMessageDocument
	| RescueStationUpdateMessageDocument
>;

export default collectionData;
