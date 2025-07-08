import {
	AlertOrgConfigBaseDocument,
	AlertingProviders,
} from '../../../libs/api/alerting/src/lib/infra/schema/alerting-org-config.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<AlertOrgConfigBaseDocument> = {
	collectionName: 'alerting-org-config',
	entries: [
		{
			orgId: 'dff7584efe2c174eee8bae45',
			type: AlertingProviders.MOCK,
			updatedAt: new Date(),
			createdAt: new Date(),
		},
	],
};

export { collectionData as default };
