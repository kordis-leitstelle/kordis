import { CollectionData } from './collection-data.model';

// this is just temporary until we have our first collections!
// mongo does not have an explicit "create db" command,
// therefor we need some data to feed the db with, so the E2Es won't fail due to a bad connection uri
const collectionData: CollectionData = {
	collectionName: 'placeholder',
	entries: [
		{
			pleaseRemoveThis: 'when we have our first collection',
		},
	],
};

export default collectionData;
