import {
	RescueStationMessageAssignedUnit,
	RescueStationMessagePayload,
} from 'libs/api/protocol/src/lib/core/entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOffMessageDocument } from 'libs/api/protocol/src/lib/infra/schema/rescue-station/rescue-station-sign-off-message.schema';
import { RescueStationSignOnMessageDocument } from 'libs/api/protocol/src/lib/infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageDocument } from 'libs/api/protocol/src/lib/infra/schema/rescue-station/rescue-station-updated-message.schema';
import { Types } from 'mongoose';

import { type CommunicationMessageDocument } from '../../../libs/api/protocol/src/lib/infra/schema/communication/communication-message.schema';
import {
	ProducerType,
	UserProducerDocument,
} from '../../../libs/api/protocol/src/lib/infra/schema/producer-partial.schema';
import { ProtocolEntryType } from '../../../libs/api/protocol/src/lib/infra/schema/protocol-entry-type.enum';
import { UnitType } from '../../../libs/api/protocol/src/lib/infra/schema/unit-partial.schema';
import {
	getAlertGroupByName,
	getAlertGroupIdAsStringByName,
} from './alert-groups.data';
import { CollectionData } from './collection-data.model';
import { getRescueStationDeploymentByName } from './deployments.data';
import { getOrganizationIdAsStringByName } from './organizations.data';
import { getUserByUsername } from './test-users';
import {
	getUnitById,
	getUnitByName,
	getUnitIdAsStringByName,
	default as unitCollection,
} from './units.data';

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
	rescueStationName: Parameters<typeof getRescueStationDeploymentByName>[0],
) => {
	const rescueStation = getRescueStationDeploymentByName(rescueStationName);
	return {
		rescueStationCallSign: rescueStation.callSign,
		rescueStationId: rescueStation._id.toString(),
		rescueStationName: rescueStation.name,
	};
};

const getUnitAsRescueStationAssignedUnit = (
	unit: (typeof unitCollection)['entries'][number],
): RescueStationMessageAssignedUnit => {
	const { _id, name, callSign } = unit;
	return { id: _id.toString(), name, callSign };
};

const getRescueStationMessagePayload = (
	rescueStationName: Parameters<typeof getRescueStationInformation>[0],
	alertGroupNames: Parameters<typeof getAlertGroupIdAsStringByName>[0][],
	unitNames: Parameters<typeof getUnitByName>[0][],
	strength?: RescueStationMessagePayload['strength'],
) => {
	const alertGroups = alertGroupNames.map((alertGroupName) => {
		const { _id, name, defaultUnits } = getAlertGroupByName(alertGroupName);
		return {
			id: _id.toString(),
			name,
			units: defaultUnits.map((unitId) =>
				getUnitAsRescueStationAssignedUnit(getUnitById(unitId)),
			),
		};
	});
	const units = unitNames.map((unitName) =>
		getUnitAsRescueStationAssignedUnit(getUnitByName(unitName)),
	);

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

const getRandomDateFromLastSevenDays = () => {
	const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
	const offset = Math.round(Math.random() * sevenDaysInMs);
	return new Date(Date.now() - offset);
};

const collectionData = {
	collectionName: 'protocol-entries',
	entries: [
		{
			_id: new Types.ObjectId('66846ba41af826ce7c50c3a4'),
			createdAt: new Date(),
			updatedAt: new Date(),
			communicationDetails: {
				channel: 'D',
				recipient: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('MRB Greif 5'),
				},
				sender: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('ATV'),
				},
			},
			payload: { message: 'Test' },
			producer: getUserAsProducer('testuser'),
			searchableText: 'Test',
			time: getRandomDateFromLastSevenDays(),
			type: ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies CommunicationMessageDocument,
		{
			_id: new Types.ObjectId('6696c4bddfe9fcb08c639c78'),
			createdAt: new Date(),
			updatedAt: new Date(),
			communicationDetails: {
				channel: 'D',
				recipient: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('MRB Greif 5'),
				},
				sender: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('RW Wittenbergen'),
				},
			},
			payload: getRescueStationMessagePayload(
				'DLRG Einsatzzentrale HH',
				[],
				['MRB Greif 5', 'ATV'],
			),
			producer: getUserAsProducer('testuser'),
			searchableText:
				'anmeldung rettungswache DLRG Einsatzzentrale HH HH 10/0 stärke 1/2/3/6 MRB Greif 5, ATV',
			time: getRandomDateFromLastSevenDays(),
			type: ProtocolEntryType.RESCUE_STATION_SIGN_ON_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies RescueStationSignOnMessageDocument,
		{
			_id: new Types.ObjectId('6696c4c2181d71124b056e80'),
			createdAt: new Date(),
			updatedAt: new Date(),
			communicationDetails: {
				channel: 'D',
				recipient: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('MRB Greif 5'),
				},
				sender: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('RW Wittenbergen'),
				},
			},
			payload: getRescueStationMessagePayload(
				'DLRG Einsatzzentrale HH',
				['SEG Altona'],
				['MRB Greif 5'],
				{ leaders: 1, helpers: 3, subLeaders: 6 },
			),
			producer: getUserAsProducer('testuser'),
			searchableText:
				'nachmeldung rettungswache DLRG Einsatzzentrale HH HH 10/0 stärke 1/3/6/10 SEG Altona MRB Greif 5',
			time: getRandomDateFromLastSevenDays(),
			type: ProtocolEntryType.RESCUE_STATION_UPDATE_ENTRY,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
		} satisfies RescueStationUpdateMessageDocument,
		{
			_id: new Types.ObjectId('6696c4c669af565692a0f030'),
			createdAt: new Date(),
			updatedAt: new Date(),
			communicationDetails: {
				channel: 'D',
				recipient: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('MRB Greif 5'),
				},
				sender: {
					type: UnitType.REGISTERED_UNIT,
					unitId: getUnitIdAsStringByName('RW Wittenbergen'),
				},
			},
			payload: getRescueStationInformation('DLRG Einsatzzentrale HH'),
			producer: getUserAsProducer('testuser'),
			searchableText:
				'ausmeldung rettungswache DLRG Einsatzzentrale HH HH 10/0',
			time: getRandomDateFromLastSevenDays(),
			type: ProtocolEntryType.RESCUE_STATION_SIGN_OFF_ENTRY,
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
