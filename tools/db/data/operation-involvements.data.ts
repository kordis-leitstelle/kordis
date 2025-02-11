import { Types } from 'mongoose';

import { OperationInvolvementDocument } from '../../../libs/api/operation/src/lib/infra/schema/operation-involvement.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<OperationInvolvementDocument> = {
	collectionName: 'operation-involvements',
	entries: [
		{
			orgId: 'dff7584efe2c174eee8bae45',
			operation: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			unitId: '65d7d9ae8b516612650163d8',
			involvementTimes: [
				{
					start: new Date('2024-01-01T00:00:00Z'),
					end: new Date('2024-01-01T00:10:00Z'),
				},
				{
					start: new Date('2024-01-01T00:11:00Z'),
					end: null,
				},
			],
			isPending: false,
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			operation: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			unitId: '65d7d90709cdb6f3b2082ab3',
			involvementTimes: [
				{
					start: new Date('2024-01-01T00:00:00Z'),
					end: new Date('2024-01-01T00:10:00Z'),
				},
			],
			isPending: true,
			alertGroupId: '66239459ef2a6ac579f55cce',
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			operation: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			unitId: '65d7da8630f360f158caec53',
			involvementTimes: [
				{
					start: new Date('2024-01-01T00:00:00Z'),
					end: null,
				},
			],
			isPending: false,
			alertGroupId: '66239459ef2a6ac579f55cce',
		},
	],
};

export default collectionData;
