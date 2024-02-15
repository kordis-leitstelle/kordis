import { DynamicModule, Logger, Module } from '@nestjs/common';

import { DevObservabilityModule } from './dev-observability.module';
import { SentryObservabilityModule } from './sentry-observability.module';
import { KordisLoggerImpl } from './services/kordis.logger';

const OBSERVABILITY_MODULES = Object.freeze({
	dev: DevObservabilityModule,
	sentry: SentryObservabilityModule,
});

@Module({})
export class ObservabilityModule {
	static forRoot(
		observabilityProvider: keyof typeof OBSERVABILITY_MODULES,
	): DynamicModule {
		return {
			module: ObservabilityModule,
			imports: [OBSERVABILITY_MODULES[observabilityProvider]],
			providers: [
				{
					provide: Logger,
					useClass: KordisLoggerImpl,
				},
			],
		};
	}
}
