import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GeospatialModule } from '@kordis/api/geospatial';

import { Warning, WarningSchema } from '../core/model/warning.model';
import { WARNING_SERVICE } from '../core/service/warnings.service';
import { WarningsResolver } from './controller/warnings.resolver';
import { WarningsCheckerJob } from './cron-job/warnings-checker.job';
import { NINA_SOURCES, NINA_SOURCES_TOKEN } from './service/nina-sources';
import { NinaWarningsService } from './service/nina-warnings.service';
import { ConfigurableModuleClass } from './warnings.module-options';

@Module({
	imports: [
		HttpModule,
		MongooseModule.forFeature([
			{
				name: Warning.name,
				schema: WarningSchema,
			},
		]),
		GeospatialModule,
	],
	providers: [
		{
			provide: WARNING_SERVICE,
			useClass: NinaWarningsService,
		},
		{
			provide: NINA_SOURCES_TOKEN,
			useValue: NINA_SOURCES,
		},
		WarningsCheckerJob,
		WarningsResolver,
	],
})
export class WarningsModule extends ConfigurableModuleClass {}
