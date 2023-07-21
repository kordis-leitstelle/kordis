import { Module } from '@nestjs/common';

import { KORDIS_LOGGER_SERVICE } from './services/kordis-logger-service.interface';
import { PinoLogger } from './services/pino-logger.service';

@Module({
	providers: [
		{
			provide: KORDIS_LOGGER_SERVICE,
			useValue: new PinoLogger(true),
		},
	],
	exports: [KORDIS_LOGGER_SERVICE],
})
export class DevObservabilityModule {}
