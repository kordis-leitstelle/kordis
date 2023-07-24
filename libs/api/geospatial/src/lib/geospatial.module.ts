import { Module } from '@nestjs/common';

import { GEOSPATIAL_SERVICE } from './core/geospatial.service';
import { GeospatialServiceImpl } from './infra/geospatial.service';

@Module({
	providers: [
		{
			provide: GEOSPATIAL_SERVICE,
			useClass: GeospatialServiceImpl,
		},
	],
	exports: [GEOSPATIAL_SERVICE],
})
export class GeospatialModule {}
