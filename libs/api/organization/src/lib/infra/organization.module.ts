import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateOrganizationHandler } from '../core/command/create-organization.command';
import { UpdateOrganizationGeoSettingsHandler } from '../core/command/update-organization-geo-settings.command';
import { GetOrganizationHandler } from '../core/query/get-organization.query';
import { ORGANIZATION_REPOSITORY } from '../core/repository/organization.repository';
import { OrganizationResolver } from './controller/organization.resolver';
import { OrganizationProfile } from './organization.mapper-profile';
import { ImplOrganizationRepository } from './repository/organization.repository';
import {
	OrganizationDocument,
	OrganizationSchema,
} from './schema/organization.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: OrganizationDocument.name, schema: OrganizationSchema },
		]),
	],
	providers: [
		OrganizationProfile,
		{
			provide: ORGANIZATION_REPOSITORY,
			useClass: ImplOrganizationRepository,
		},
		OrganizationResolver,
		UpdateOrganizationGeoSettingsHandler,
		GetOrganizationHandler,
		CreateOrganizationHandler,
	],
})
export class OrganizationModule {}
