import { Types } from 'mongoose';

import { UnitDocument } from '../../../libs/api/unit/src/lib/infra/schema/unit.schema';
import { CollectionData } from './collection-data.model';

const collectionData: CollectionData<UnitDocument> = {
	collectionName: 'units',
	entries: [
		{
			_id: new Types.ObjectId('65d7d90709cdb6f3b2082ab3'),
			createdAt: new Date(),
			status: null,
			name: 'MRB Greif 5',
			callSign: 'HH 12/42',
			callSignAbbreviation: '1242',
			orgId: 'dff7584efe2c174eee8bae45',
			department: 'DLRG Bz Altona e.V.',
			rcsId: 'issiGreif5',
			furtherAttributes: [
				{
					name: 'MMSI',
					value: '211397810',
				},
			],
			note: 'Aktuell kein O2!',
		},
		{
			_id: new Types.ObjectId('65d7d9ae8b516612650163d8'),
			createdAt: new Date(),
			status: {
				status: 1,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'ATV',
			callSign: 'HH 12/54',
			callSignAbbreviation: '1254',
			orgId: 'dff7584efe2c174eee8bae45',
			department: 'DLRG Bz Altona e.V.',
			rcsId: 'issiARV',
			furtherAttributes: [
				{
					name: 'Sitze',
					value: '3',
				},
			],
			note: '',
		},
		{
			_id: new Types.ObjectId('65d7da8630f360f158caec53'),
			createdAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'GW Tauchen',
			callSign: 'HH 10/53',
			callSignAbbreviation: '1053',
			orgId: 'dff7584efe2c174eee8bae45',
			department: 'DLRG LV Hamburg e.V.',
			rcsId: 'issiGWTauchen',
			furtherAttributes: [
				{
					name: 'Tauchgeräte',
					value: '4',
				},
			],
			note: 'Sofortige EB bei Alarmierung über Divera!',
		},
		{
			_id: new Types.ObjectId('661d51d719bfd9cb73e27834'),
			createdAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'MRB Greif 1',
			callSign: 'HH 12/41',
			callSignAbbreviation: '1241',
			orgId: 'dff7584efe2c174eee8bae45',
			department: 'DLRG Bz Altona e.V.',
			rcsId: 'issiGreif1',
			furtherAttributes: [],
			note: '',
		},
		{
			_id: new Types.ObjectId('661d523ecc560fd0042fe40e'),
			createdAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'GW-Wasserrettung',
			callSign: 'HH 13/52',
			callSignAbbreviation: '1352',
			orgId: 'dff7584efe2c174eee8bae45',
			department: 'DLRG Bz Bergedorf e.V.',
			rcsId: 'issiGwwr',
			furtherAttributes: [],
			note: '',
		},
		{
			_id: new Types.ObjectId('661d52f2459197edda093912'),
			createdAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'MRB Greif 14',
			callSign: 'HH 16/42',
			callSignAbbreviation: '1642',
			orgId: 'dff7584efe2c174eee8bae45',
			department: 'DLRG Bz Harburg e.V.',
			rcsId: 'issiGreif14',
			furtherAttributes: [],
			note: '',
		},
	],
};

export default collectionData;
