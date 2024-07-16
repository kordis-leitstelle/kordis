import { Types } from 'mongoose';

import { AlertGroupDocument } from '../../../libs/api/unit/src/lib/infra/schema/alert-group.schema';
import {
	CollectionData,
	getEntryByFieldFunction,
} from './collection-data.model';
import { getOrganizationIdAsStringByName } from './organizations.data';
import { getUnitByName } from './units.data';

const collectionData = {
	collectionName: 'alert-groups',
	entries: [
		{
			_id: new Types.ObjectId('66155eb19bceefe5e63fa651'),
			createdAt: new Date(),
			updatedAt: new Date(),
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			name: 'SEG Altona',
			units: [getUnitByName('ATV')._id],
		},
		{
			_id: new Types.ObjectId('66239459ef2a6ac579f55cce'),
			createdAt: new Date(),
			updatedAt: new Date(),
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			name: 'SEG Tauchen',
			units: [getUnitByName('GW Tauchen')._id],
		},
		{
			_id: new Types.ObjectId('662394314aab59510b80e38a'),
			createdAt: new Date(),
			updatedAt: new Date(),
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			name: 'SEG Sonar (Bergedorf)',
			units: [getUnitByName('GW-Wasserrettung')._id],
		},
	],
} as const satisfies CollectionData<AlertGroupDocument>;

const {
	entityFunction: getAlertGroupByName,
	entityIdFunction: getAlertGroupIdAsStringByName,
} = getEntryByFieldFunction(collectionData, 'name');

export {
	collectionData as default,
	getAlertGroupByName,
	getAlertGroupIdAsStringByName,
};
