import { Types } from 'mongoose';

import { OperationInvolvementDocument } from '../../../libs/api/operation/src/lib/infra/schema/operation-involvement.schema';
import { CollectionData } from './collection-data.model';
import { getUnitIdAsStringByName } from './units.data';

const collectionData: CollectionData<OperationInvolvementDocument> = {
	collectionName: 'operation-involvements',
	entries: [
		{
			orgId: 'dff7584efe2c174eee8bae45',
			operation: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			unitId: getUnitIdAsStringByName('ATV'),
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
			isDeleted: false,
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			operation: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			unitId: getUnitIdAsStringByName('MRB Greif 5'),
			involvementTimes: [
				{
					start: new Date('2024-01-01T00:00:00Z'),
					end: new Date('2024-01-01T00:10:00Z'),
				},
			],
			isPending: true,
			isDeleted: false,
			alertGroupId: '66239459ef2a6ac579f55cce',
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			operation: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			unitId: getUnitIdAsStringByName('GW Tauchen'),
			involvementTimes: [
				{
					start: new Date('2024-01-01T00:00:00Z'),
					end: null,
				},
			],
			isPending: false,
			isDeleted: false,
			alertGroupId: '66239459ef2a6ac579f55cce',
		},
	],
};

export default collectionData;
