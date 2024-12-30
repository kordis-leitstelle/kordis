import { Types } from 'mongoose';

import {
	CollectionData,
	getEntryByFieldFunction,
} from './collection-data.model';

const collectionData: CollectionData<{
	propertyA: string;
	propertyB: string;
}> = {
	collectionName: 'collectionXY',
	entries: [
		// this is the data that will be imported into the collection
		{
			_id: new Types.ObjectId('your custom id here'), // you can also override the default _id if you need it for "relations""
			propertyA: 'test 1A',
			propertyB: 'test 1B',
		},
		{
			propertyA: 'test 2A',
			propertyB: 'test 2B',
		},
		//...
	],
};

// rename and adjust the lookup function
const {
	entityFunction: getTemplateByName,
	entityIdFunction: getTeplateIdAsStringByName,
} = getEntryByFieldFunction(collectionData, 'propertyA');

export {
	collectionData as default,
	getTemplateByName,
	getTeplateIdAsStringByName,
};
