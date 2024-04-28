import { Types } from 'mongoose';

import { AlertGroupDocument } from '../../../libs/api/unit/src/lib/infra/schema/alert-group.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<AlertGroupDocument> = {
	collectionName: 'alert-groups',
	entries: [
		{
			_id: new Types.ObjectId('66155eb19bceefe5e63fa651'),
			orgId: 'dff7584efe2c174eee8bae45',
			name: 'SEG Altona',
			units: [new Types.ObjectId('65d7d9ae8b516612650163d8')],
		},
		{
			_id: new Types.ObjectId('66239459ef2a6ac579f55cce'),
			orgId: 'dff7584efe2c174eee8bae45',
			name: 'SEG Tauchen',
			units: [new Types.ObjectId('65d7da8630f360f158caec53')],
		},
		{
			_id: new Types.ObjectId('662394314aab59510b80e38a'),
			orgId: 'dff7584efe2c174eee8bae45',
			name: 'SEG Sonar (Bergedorf)',
			units: [new Types.ObjectId('661d523ecc560fd0042fe40e')],
		},
	],
};

export default collectionData;
