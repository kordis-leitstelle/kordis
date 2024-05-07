import { Types } from 'mongoose';

import type {
	AlertGroupAssignmentDocument,
	UnitAssignmentDocument,
} from '../../../libs/api/deployment/src/lib/infra/schema/deployment-assignment.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<
	UnitAssignmentDocument | AlertGroupAssignmentDocument
> = {
	collectionName: 'deployment-assignments',
	entries: [
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '65d7d90709cdb6f3b2082ab3', // Greif 5
			deploymentId: new Types.ObjectId('65d7e01b4ecd7d5b2d380ca4'), // EZ
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '65d7d9ae8b516612650163d8', // ATV
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '65d7da8630f360f158caec53', // GWT
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '661d51d719bfd9cb73e27834', // Greif 1
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '661d523ecc560fd0042fe40e', // GW-WR
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '661d52f2459197edda093912', // Greif 14
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '66155eb19bceefe5e63fa651', // SEG Altona
			deploymentId: new Types.ObjectId('65d7e01b4ecd7d5b2d380ca4'),
			type: 'ALERT_GROUP',
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '66239459ef2a6ac579f55cce', // SEG Tauchen
			deploymentId: null,
			type: 'ALERT_GROUP',
		},
		{
			orgId: 'dff7584efe2c174eee8bae45',
			entityId: '662394314aab59510b80e38a', // SEG Sonar
			deploymentId: null,
			type: 'ALERT_GROUP',
		},
	],
};

export default collectionData;
