import { Logger, Module } from '@nestjs/common';

import { KORDIS_LOGGER_SERVICE } from './services/kordis-logger-service.interface';
import { KordisLoggerImpl } from './services/kordis.logger';
import { PinoLogger } from './services/pino-logger.service';

@Module({
	providers: [
		{
			provide: KORDIS_LOGGER_SERVICE,
			useValue: new PinoLogger(true),
		},
		{
			provide: Logger,
			useClass: KordisLoggerImpl,
		},
	],
})
export class DevObservabilityModule {}
