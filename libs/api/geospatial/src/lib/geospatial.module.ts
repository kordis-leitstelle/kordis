import { Module } from '@nestjs/common';

import { GEOSPATIAL_TYPE_CONVERTER } from './core/geospatial-types.converter';
import { GEOSPATIAL_SERVICE } from './core/geospatial.service';
import { GeospatialTypesConverterImpl } from './infra/geospatial-types.converter';
import { GeospatialServiceImpl } from './infra/geospatial.service';

@Module({
	providers: [
		{
			provide: GEOSPATIAL_SERVICE,
			useClass: GeospatialServiceImpl,
		},
		{
			provide: GEOSPATIAL_TYPE_CONVERTER,
			useClass: GeospatialTypesConverterImpl,
		},
	],
	exports: [GEOSPATIAL_SERVICE, GEOSPATIAL_TYPE_CONVERTER],
})
export class GeospatialModule {}
