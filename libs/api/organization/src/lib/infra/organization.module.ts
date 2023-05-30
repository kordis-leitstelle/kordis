import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UpdateOrganizationGeoSettingsHandler } from '../core/command/update-organization-geo-settings.command';
import { GetOrganizationHandler } from '../core/query/get-organization.query';
import { ORGANIZATION_REPOSITORY } from '../core/repository/organization.repository';
import { OrganizationResolver } from './controller/organization.resolver';
import { OrganizationProfile } from './organization.mapper-profile';
import { ImplOrganizationRepository } from './repository/organization.repository';
import { Organization, OrganizationSchema } from './schema/organization.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Organization.name, schema: OrganizationSchema },
		]),
		CqrsModule,
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
	],
})
export class OrganizationModule {}
