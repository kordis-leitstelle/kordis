import { Types } from 'mongoose';

import { DeploymentType } from '../../../libs/api/deployment/src/lib/infra/schema/deployment-type.enum';
import { RescueStationDeploymentDocument } from '../../../libs/api/deployment/src/lib/infra/schema/rescue-station-deployment.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<RescueStationDeploymentDocument> = {
	collectionName: 'deployments',
	entries: [
		{
			_id: new Types.ObjectId('65d7e01b4ecd7d5b2d380ca4'),
			referenceId: '65d7e01b4ecd7d5b2d380ca4',
			orgId: 'dff7584efe2c174eee8bae45',
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
			referenceId: '6615542b3063c832feb732ab',
			name: 'DLRG RW Hohendeich',
			type: DeploymentType.RESCUE_STATION,
			orgId: 'dff7584efe2c174eee8bae45',
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
			referenceId: '661d516bb912a6f426c13dea',
			name: 'DLRG RW Süderelbe',
			type: DeploymentType.RESCUE_STATION,
			callSign: 'HH 16/0',
			orgId: 'dff7584efe2c174eee8bae45',
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
	],
};

export default collectionData;
