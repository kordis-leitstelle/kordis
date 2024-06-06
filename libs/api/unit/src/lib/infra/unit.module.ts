import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UpdateUnitNoteHandler } from '../core/command/update-unit-note.command';
import { UpdateUnitStatusHandler } from '../core/command/update-unit-status.command';
import { GetAlertGroupByIdHandler } from '../core/query/get-alert-group-by-id.query';
import { GetAlertGroupsByIdsHandler } from '../core/query/get-alert-groups-by-ids.query';
import { GetAlertGroupsByOrgHandler } from '../core/query/get-alert-groups-by.org.query';
import { GetUnitByIdHandler } from '../core/query/get-unit-by-id.query';
import { GetUnitByRCSIDHandler } from '../core/query/get-unit-by-rcs-id.query';
import { GetUnitsByIdsHandler } from '../core/query/get-units-by-ids.query';
import { GetUnitsByOrgHandler } from '../core/query/get-units-by-org.query';
import { ALERT_GROUP_REPOSITORY } from '../core/repository/alert-group.repository';
import { UNIT_REPOSITORY } from '../core/repository/unit.repository';
import { AlertGroupsDataLoader } from '../data-loader/alert-groups.data-loader';
import { UnitsDataLoader } from '../data-loader/units.data-loader';
import { AlertGroupResolver } from './controller/alert-group.resolver';
import { UnitResolver } from './controller/unit.resolver';
import { AlertGroupProfile } from './mapper/alert-group.mapper-profile';
import {
	UnitProfile,
	UnitValueObjectProfile,
} from './mapper/unit.mapper-profile';
import { AlertGroupRepositoryImpl } from './repository/alert-group.repository';
import { UnitRepositoryImpl } from './repository/unit.repository';
import {
	AlertGroupDocument,
	AlertGroupSchema,
} from './schema/alert-group.schema';
import { UnitDocument, UnitSchema } from './schema/unit.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UnitDocument.name, schema: UnitSchema },
			{ name: AlertGroupDocument.name, schema: AlertGroupSchema },
		]),
	],
	providers: [
		{
			provide: UNIT_REPOSITORY,
			useClass: UnitRepositoryImpl,
		},
		{
			provide: ALERT_GROUP_REPOSITORY,
			useClass: AlertGroupRepositoryImpl,
		},
		UnitProfile,
		UnitValueObjectProfile,
		AlertGroupProfile,
		GetUnitsByOrgHandler,
		GetUnitByRCSIDHandler,
		GetUnitsByIdsHandler,
		GetUnitByIdHandler,
		GetAlertGroupsByIdsHandler,
		GetAlertGroupByIdHandler,
		GetAlertGroupsByOrgHandler,
		UpdateUnitNoteHandler,
		UpdateUnitStatusHandler,
		UnitResolver,
		AlertGroupResolver,
		UnitsDataLoader,
		AlertGroupsDataLoader,
	],
})
export class UnitModule {}
