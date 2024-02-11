import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
	GEOSPATIAL_SERVICE,
	GeospatialModule,
	GeospatialService,
} from '@kordis/api/geospatial';

import { Warning, WarningSchema } from '../core/model/warning.model';
import { WARNINGS_SERVICE } from '../core/service/warnings.service';
import { WarningsResolver } from './controller/warnings.resolver';
import { NINA_SOURCES, NINA_SOURCES_TOKEN } from './service/nina-sources';
import { NinaWarningsService } from './service/nina-warnings.service';
import {
	ConfigurableModuleClass,
	MODULE_OPTIONS_TOKEN,
	WarningOptions,
} from './warnings.module-options';
import { BackgroundJob, WorkerManager } from '@kordis/api/shared';
import { Model } from 'mongoose';
import { of } from 'rxjs';

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
			provide: WARNINGS_SERVICE,
			useFactory: (
				ninaSourcesOfInterest: string[],
				conf: WarningOptions,
				model: Model<Warning>,
				geospatialService: GeospatialService,
			) => {
				let ninaBackgroundJob: BackgroundJob<Warning>;
				if (conf.checkForNewWarningsIntervalSec) {
					using ninaWarningsWorkerManager = new WorkerManager<
						{
							ninaSourcesOfInterest: string[];
							checkIntervalSec: number;
							mongoUri: string;
						},
						Warning
					>('workers/nina-warnings.worker.js', {
						ninaSourcesOfInterest,
						checkIntervalSec: conf.checkForNewWarningsIntervalSec,
						mongoUri: conf.mongoUri,
					});
					ninaBackgroundJob = ninaWarningsWorkerManager;
				} else {
					ninaBackgroundJob = {
						getChangeStream$: () => of(),
					};
				}

				return new NinaWarningsService(
					ninaBackgroundJob,
					model,
					geospatialService,
				);
			},
			inject: [NINA_SOURCES_TOKEN, MODULE_OPTIONS_TOKEN, GEOSPATIAL_SERVICE],
		},
		{
			provide: NINA_SOURCES_TOKEN,
			useValue: NINA_SOURCES,
		},
		WarningsResolver,
	],
})
export class WarningsModule extends ConfigurableModuleClass {}
