import { DynamicModule, Logger, Module } from '@nestjs/common';

import { DevObservabilityModule } from './dev-observability.module';
import { SentryObservabilityModule } from './sentry-observability.module';
import { KordisLoggerImpl } from './services/kordis.logger';

const OBSERVABILITY_STRATEGY_MODULES = Object.freeze({
	sentry: SentryObservabilityModule,
	dev: DevObservabilityModule,
});

@Module({})
export class ObservabilityModule {
	static forRoot(
		strategy: keyof typeof OBSERVABILITY_STRATEGY_MODULES,
	): DynamicModule {
		return {
			module: OBSERVABILITY_STRATEGY_MODULES[strategy],
			providers: [
				{
					provide: Logger,
					useClass: KordisLoggerImpl,
				},
			],
		};
	}
}
