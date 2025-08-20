import { GeoFeatureDocument } from '../../../libs/api/organization/src/lib/infra/schema/geo-feature.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<GeoFeatureDocument> = {
	collectionName: 'geo-features',
	entries: [
		{
			orgId: 'dff7584efe2c174eee8bae45',
			createdAt: new Date(),
			updatedAt: new Date(),
			name: 'Anleger Wittenbergen',
			coordinate: {
				lat: 53.563011,
				lon: 9.754574,
			},
			city: '',
			street: '',
			postalCode: '',
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			createdAt: new Date(),
			updatedAt: new Date(),
			name: 'Tonne 124',
			coordinate: {
				lat: 53.562989,
				lon: 9.753196,
			},
			city: '',
			street: '',
			postalCode: '',
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			createdAt: new Date(),
			updatedAt: new Date(),
			name: 'DLRG Bezirk Altona/COH',
			coordinate: {
				lat: 53.5481213,
				lon: 9.8578594,
			},
			city: 'Hamburg',
			street: 'Elbchaussee 351',
			postalCode: '22609',
		},
	],
};

export { collectionData as default };
