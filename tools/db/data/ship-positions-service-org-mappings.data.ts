import { ShipPositionsServiceOrgMappingsDocument } from '../../../libs/api/ship-positions/src/lib/infra/schema/ship-positions-service-org-mappings.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<ShipPositionsServiceOrgMappingsDocument> =
	{
		collectionName: 'shipPositionsServiceOrgMappings',
		entries: [
			{
				orgId: 'dff7584efe2c174eee8bae45',
				provider: 'hpa',
			},
		],
	};

export default collectionData;
