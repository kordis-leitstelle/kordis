import { Types } from 'mongoose';

import { UnitDocument } from '../../../libs/api/unit/src/lib/infra/schema/unit.schema';
import {
	CollectionData,
	getEntryByFieldFunction,
} from './collection-data.model';
import { getOrganizationIdAsStringByName } from './organizations.data';

const collectionData = {
	collectionName: 'units',
	entries: [
		{
			_id: new Types.ObjectId('65d7d90709cdb6f3b2082ab3'),
			createdAt: new Date(),
			updatedAt: new Date(),
			status: null,
			name: 'MRB Greif 5',
			callSign: 'HH 12/42',
			callSignAbbreviation: '1242',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
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
			updatedAt: new Date(),
			status: {
				status: 1,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'ATV',
			callSign: 'HH 12/54',
			callSignAbbreviation: '1254',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			department: 'DLRG Bz Altona e.V.',
			rcsId: 'issiATV',
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
			updatedAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'GW Tauchen',
			callSign: 'HH 10/53',
			callSignAbbreviation: '1053',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
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
			updatedAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'MRB Greif 1',
			callSign: 'HH 12/41',
			callSignAbbreviation: '1241',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			department: 'DLRG Bz Altona e.V.',
			rcsId: 'issiGreif1',
			furtherAttributes: [],
			note: '',
		},
		{
			_id: new Types.ObjectId('661d523ecc560fd0042fe40e'),
			createdAt: new Date(),
			updatedAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'GW-Wasserrettung',
			callSign: 'HH 13/52',
			callSignAbbreviation: '1352',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			department: 'DLRG Bz Bergedorf e.V.',
			rcsId: 'issiGwwr',
			furtherAttributes: [],
			note: '',
		},
		{
			_id: new Types.ObjectId('661d52f2459197edda093912'),
			createdAt: new Date(),
			updatedAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'MRB Greif 14',
			callSign: 'HH 16/42',
			callSignAbbreviation: '1642',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			department: 'DLRG Bz Harburg e.V.',
			rcsId: 'issiGreif14',
			furtherAttributes: [],
			note: '',
		},
		{
			_id: new Types.ObjectId('6696a5094bdeb80549f2da01'),
			createdAt: new Date(),
			updatedAt: new Date(),
			status: {
				status: 2,
				source: 'TetraControl',
				receivedAt: new Date(),
			},
			name: 'RW Wittenbergen',
			callSign: 'HH 10/0',
			callSignAbbreviation: '100',
			orgId: getOrganizationIdAsStringByName('Test Organisation'),
			department: 'DLRG LV Hamburg e.V.',
			rcsId: 'issiRWWB',
			furtherAttributes: [],
			note: '',
		},
	],
} as const satisfies CollectionData<UnitDocument>;

const {
	entityFunction: getUnitByName,
	entityIdFunction: getUnitIdAsStringByName,
} = getEntryByFieldFunction(collectionData, 'name');

const { entityFunction: getUnitById } = getEntryByFieldFunction(
	collectionData,
	'_id',
);

export {
	collectionData as default,
	getUnitByName,
	getUnitIdAsStringByName,
	getUnitById,
};
