import { Types } from 'mongoose';

import { OrganizationDocument } from '../../../libs/api/organization/src/lib/infra/schema/organization.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<Partial<OrganizationDocument>> = {
	collectionName: 'organizations',
	entries: [
		{
			_id: new Types.ObjectId('dff7584efe2c174eee8bae45'),
			name: 'Test Organisation',
			settings: {
				// hamburg
				geo: {
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
		},
	],
};

export default collectionData;
