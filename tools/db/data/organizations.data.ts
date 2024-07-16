import { Types } from 'mongoose';

import { OrganizationDocument } from '../../../libs/api/organization/src/lib/infra/schema/organization.schema';
import {
	CollectionData,
	getEntryByFieldFunction,
} from './collection-data.model';

const collectionData = {
	collectionName: 'organizations',
	entries: [
		{
			_id: new Types.ObjectId('dff7584efe2c174eee8bae45'),
			name: 'Test Organisation',
			createdAt: new Date(),
			updatedAt: new Date(),
			orgId: 'dff7584efe2c174eee8bae45',
			// hamburg
			geoSettings: {
				bbox: {
					topLeft: {
						lat: 53.38,
						lon: 9.65,
					},
					bottomRight: {
						lat: 53.75,
						lon: 10.33,
					},
				},
				centroid: {
					lat: 53.551086,
					lon: 9.993682,
				},
			},
		},
	],
} as const satisfies CollectionData<OrganizationDocument>;

const {
	entityFunction: getOrganizationByName,
	entityIdFunction: getOrganizationIdAsStringByName,
} = getEntryByFieldFunction(collectionData, 'name');

export {
	collectionData as default,
	getOrganizationByName,
	getOrganizationIdAsStringByName,
};
