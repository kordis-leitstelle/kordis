import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateOrganizationHandler } from '../core/command/create-organization.command';
import { UpdateOrganizationGeoSettingsHandler } from '../core/command/update-organization-geo-settings.command';
import { GetGeoFeaturesHandler } from '../core/query/get-geo-features.query';
import { GetOrganizationHandler } from '../core/query/get-organization.query';
import { GEO_FEATURE_REPOSITORY } from '../core/repository/geo-feature.repository';
import { ORGANIZATION_REPOSITORY } from '../core/repository/organization.repository';
import { GeoFeaturesResolver } from './controller/geo-features.resolver';
import { OrganizationResolver } from './controller/organization.resolver';
import { GeoFeatureProfile } from './mapper/geo-feature.mapper-profile';
import {
	OrganizationProfile,
	OrganizationValueObjectsProfile,
} from './mapper/organization.mapper-profile';
import { GeoFeatureRepositoryImpl } from './repository/geo-feature.repository';
import { OrganizationRepositoryImpl } from './repository/organization.repository';
import {
	GeoFeatureDocument,
	GeoFeatureSchema,
} from './schema/geo-feature.schema';
import {
	OrganizationDocument,
	OrganizationSchema,
} from './schema/organization.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: OrganizationDocument.name, schema: OrganizationSchema },
			{ name: GeoFeatureDocument.name, schema: GeoFeatureSchema },
		]),
	],
	providers: [
		OrganizationProfile,
		GeoFeatureProfile,
		OrganizationValueObjectsProfile,
		{
			provide: ORGANIZATION_REPOSITORY,
			useClass: OrganizationRepositoryImpl,
		},
		{
			provide: GEO_FEATURE_REPOSITORY,
			useClass: GeoFeatureRepositoryImpl,
		},
		OrganizationResolver,
		UpdateOrganizationGeoSettingsHandler,
		GetOrganizationHandler,
		CreateOrganizationHandler,
		GetGeoFeaturesHandler,
		GeoFeaturesResolver,
	],
})
export class OrganizationModule {}
