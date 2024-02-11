import { Module } from '@nestjs/common';

import { GEOSPATIAL_SERVICE } from './core/geospatial.service';
import { GeospatialServiceImpl } from './infra/geospatial.service';
import { GEOSPATIAL_TYPE_CONVERTER } from './core/geospatial-types.converter';
import { GeospatialTypesConverterImpl } from './infra/geospatial-types.converter';

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
