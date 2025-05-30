import { Types } from 'mongoose';

import { DeploymentType } from '../../../libs/api/deployment/src/lib/infra/schema/deployment-type.enum';
import { OperationDeploymentDocument } from '../../../libs/api/deployment/src/lib/infra/schema/operation-deployment.schema';
import { RescueStationDeploymentDocument } from '../../../libs/api/deployment/src/lib/infra/schema/rescue-station-deployment.schema';
import {
	CollectionData,
	getEntryByFieldFunction,
} from './collection-data.model';
import { getOrganizationIdAsStringByName } from './organizations.data';

const collectionData = {
	collectionName: 'deployments',
	entries: [
		{
			_id: new Types.ObjectId('65d7e01b4ecd7d5b2d380ca4'),
			createdAt: new Date(),
			updatedAt: new Date(),
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			name: 'DLRG Einsatzzentrale HH',
			type: DeploymentType.RESCUE_STATION,
			callSign: 'HH 10/0',
			defaultUnitIds: [],
			location: {
				address: {
					city: 'Hamburg',
					postalCode: '22559',
					street: 'Rissener Ufer 29',
				},
				coordinate: {
					lat: 53.56397,
					lon: 9.75567,
				},
			},
			note: '',
			signedIn: true,
			strength: {
				helpers: 3,
				leaders: 1,
				subLeaders: 1,
			},
		},
		{
			_id: new Types.ObjectId('6615542b3063c832feb732ab'),
			createdAt: new Date(),
			updatedAt: new Date(),
			name: 'DLRG RW Hohendeich',
			type: DeploymentType.RESCUE_STATION,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			callSign: 'HH 13/0',
			defaultUnitIds: [],
			location: {
				address: {
					city: 'Hamburg',
					postalCode: '21037',
					street: 'Hohendeich',
				},
				coordinate: {
					lat: 53.44475,
					lon: 10.11029,
				},
			},
			note: 'Notiz 123',
			signedIn: true,
			strength: {
				helpers: 5,
				leaders: 1,
				subLeaders: 1,
			},
		},
		{
			_id: new Types.ObjectId('661d516bb912a6f426c13dea'),
			createdAt: new Date(),
			updatedAt: new Date(),
			name: 'DLRG RW Süderelbe',
			type: DeploymentType.RESCUE_STATION,
			callSign: 'HH 16/0',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			defaultUnitIds: ['661d52f2459197edda093912'],
			location: {
				address: {
					city: 'Hamburg',
					postalCode: '21109',
					street: ' Finkenrieker Hauptdeich 5',
				},
				coordinate: {
					lat: 53.47438,
					lon: 10.00176,
				},
			},
			note: '',
			signedIn: false,
			strength: {
				helpers: 0,
				leaders: 0,
				subLeaders: 0,
			},
		},
		{
			_id: new Types.ObjectId('67a3593fc5ffa177a6efe612'),
			createdAt: new Date(),
			updatedAt: new Date(),
			type: DeploymentType.OPERATION,
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			operationId: '663b47a3146d7fbe28ad1e66',
		},
	],
} as const satisfies CollectionData<
	RescueStationDeploymentDocument | OperationDeploymentDocument
>;

const { entityFunction: getRescueStationDeploymentByName } =
	getEntryByFieldFunction(
		collectionData as CollectionData<RescueStationDeploymentDocument>,
		'name',
	);

export { getRescueStationDeploymentByName };

export default collectionData;
