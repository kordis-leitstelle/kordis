import { Types } from 'mongoose';

import type {
	AlertGroupAssignmentDocument,
	UnitAssignmentDocument,
} from '../../../libs/api/deployment/src/lib/infra/schema/deployment-assignment.schema';
import { getAlertGroupIdAsStringByName } from './alert-groups.data';
import { CollectionData } from './collection-data.model';
import { getDeploymentByName } from './deployments.data';
import { getOrganizationIdAsStringByName } from './organizations.data';
import { getUnitIdAsStringByName } from './units.data';

const collectionData = {
	collectionName: 'deployment-assignments',
	entries: [
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getUnitIdAsStringByName('MRB Greif 5'),
			deploymentId: getDeploymentByName('DLRG Einsatzzentrale HH')._id,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getUnitIdAsStringByName('ATV'),
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getUnitIdAsStringByName('GW Tauchen'),
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getUnitIdAsStringByName('MRB Greif 1'),
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getUnitIdAsStringByName('GW-Wasserrettung'),
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getUnitIdAsStringByName('MRB Greif 14'),
			deploymentId: null,
			type: 'UNIT',
			alertGroupId: null,
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getAlertGroupIdAsStringByName('SEG Altona'),
			deploymentId: new Types.ObjectId('65d7e01b4ecd7d5b2d380ca4'),
			type: 'ALERT_GROUP',
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getAlertGroupIdAsStringByName('SEG Tauchen'),
			deploymentId: null,
			type: 'ALERT_GROUP',
		},
		{
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			createdAt: new Date(),
			updatedAt: new Date(),
			entityId: getAlertGroupIdAsStringByName('SEG Sonar (Bergedorf)'),
			deploymentId: null,
			type: 'ALERT_GROUP',
		},
	],
} as const satisfies CollectionData<
	UnitAssignmentDocument | AlertGroupAssignmentDocument
>;

export default collectionData;
