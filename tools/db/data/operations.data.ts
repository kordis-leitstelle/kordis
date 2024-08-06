import { Types } from 'mongoose';

import { OperationProcessState } from '../../../libs/api/operation/src/lib/core/entity/operation-process-state.enum';
import { OperationDocument } from '../../../libs/api/operation/src/lib/infra/schema/operation.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<OperationDocument> = {
	collectionName: 'operations',
	entries: [
		{
			_id: new Types.ObjectId('663b47a3146d7fbe28ad1e66'),
			orgId: 'dff7584efe2c174eee8bae45',
			sign: '2024/01/001',
			createdAt: new Date('2024-01-01T00:00:00Z'),
			updatedAt: new Date('2024-01-01T00:00:00Z'),
			start: new Date('2024-01-01T00:00:00Z'),
			end: null,
			createdByUserId: 'someUser',
			processState: OperationProcessState.ON_GOING,
			commander: 'Max Mustermann',
			alarmKeyword: 'THWAY',
			description: 'Ich so, dann so... Unfall',
			externalReference: 'HELS1234',
			reporter: 'F',
			categories: [
				{
					name: 'Erste-Hilfe-Leistung',
					count: 1,
					dangerousSituationCount: 0,
					patientCount: 1,
					wasDangerous: false,
				},
			],
			patients: [],
			location: {
				address: {
					name: 'Mühlenberger Loch',
					street: 'Neuenfelder Hauptdeich',
					postalCode: '21129',
					city: 'Hamburg',
				},
				coordinate: {
					lat: 53.533553,
					lon: 9.794721,
				},
			},
		},
		{
			_id: new Types.ObjectId('6655e84385774c69ad4b3f2e'),
			orgId: 'dff7584efe2c174eee8bae45',
			sign: '2024/01/002',
			createdAt: new Date('2024-01-02T00:00:00Z'),
			updatedAt: new Date('2024-01-02T00:00:00Z'),
			start: new Date('2024-01-02T00:00:00Z'),
			end: new Date('2024-01-02T00:15:00Z'),
			createdByUserId: 'someUser',
			processState: OperationProcessState.COMPLETED,
			commander: 'Max Mustermann',
			alarmKeyword: 'THWAY',
			description: 'Gar nix gut',
			externalReference: 'HELS1234',
			reporter: 'F',
			categories: [
				{
					name: 'Erste-Hilfe-Leistung',
					count: 1,
					dangerousSituationCount: 0,
					patientCount: 1,
					wasDangerous: false,
				},
				{
					name: 'Lebensrettung',
					count: 1,
					dangerousSituationCount: 1,
					patientCount: 1,
					wasDangerous: true,
				},
			],
			patients: [],
			location: {
				address: {
					name: '',
					street: 'Elbchaussee 351',
					postalCode: '22765',
					city: 'Hamburg',
				},
				coordinate: {
					lat: 53.548121,
					lon: 9.857859,
				},
			},
		},
	],
};

export default collectionData;
