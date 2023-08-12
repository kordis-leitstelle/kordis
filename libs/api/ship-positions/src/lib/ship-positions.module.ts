import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY } from './core/repository/org-ship-positions-provider.repository';
import { SHIP_POSITIONS_SERVICE_PROVIDER } from './core/service/ship-positions-service.provider';
import { ShipPositionsResolver } from './infra/controller/ship-positions.resolver';
import { HpaShipPositionsService } from './infra/provider/hpa/hpa-ship-positions.service';
import { NoopShipPositionsService } from './infra/provider/noop/noop-ship-positions.service';
import { OrgShipPositionsProviderRepositoryImpl } from './infra/repository/org-ship-positions-provider.repository';
import {
	HPAShipPositionDocument,
	HpaShipPositionSchema,
} from './infra/schema/hpa-ship-position.schema';
import {
	ShipPositionsServiceOrgMappingsDocument,
	ShipPositionsServiceOrgMappingsSchema,
} from './infra/schema/ship-positions-service-org-mappings.schema';
import { ShipPositionsServiceProviderImpl } from './infra/service/ship-positions-service.provider';
import { ShipPositionMapperProfile } from './infra/ship-position.mapper-profile';
import { ConfigurableModuleClass } from './infra/ship-positions.module-options';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: HPAShipPositionDocument.name, schema: HpaShipPositionSchema },
			{
				name: ShipPositionsServiceOrgMappingsDocument.name,
				schema: ShipPositionsServiceOrgMappingsSchema,
			},
		]),
	],
	providers: [
		ShipPositionMapperProfile,
		{
			provide: SHIP_POSITIONS_SERVICE_PROVIDER,
			useClass: ShipPositionsServiceProviderImpl,
		},
		{
			provide: ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY,
			useClass: OrgShipPositionsProviderRepositoryImpl,
		},

		HpaShipPositionsService,
		NoopShipPositionsService,
		ShipPositionsResolver,
	],
})
export class ShipPositionsModule extends ConfigurableModuleClass {}
