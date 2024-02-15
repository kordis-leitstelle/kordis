import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, ModulesContainer } from '@nestjs/core';
import { init as initSentry } from '@sentry/node';

import { SentryExceptionsFilter } from './filters/sentry-exceptions.filter';
import { SentryOTelUserContextInterceptor } from './interceptors/sentry-otel-user-context.interceptor';
import oTelSDK from './oTelSdk';
import { KORDIS_LOGGER_SERVICE } from './services/kordis-logger-service.interface';
import { KordisLogger } from './services/kordis-logger.interface';
import { SentryLogger } from './services/sentry-logger.service';
import { wrapProvidersWithTracingSpans } from './trace-wrapper';

// This Module must come after the AuthModule, because it depends on the use set by the AuthInterceptor
@Module({
	providers: [
		{
			provide: KORDIS_LOGGER_SERVICE,
			useClass: SentryLogger,
		},
		{
			provide: APP_FILTER,
			useClass: SentryExceptionsFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: SentryOTelUserContextInterceptor,
		},
	],
})
export class SentryObservabilityModule implements OnModuleInit {
	private readonly logger: KordisLogger = new Logger(
		SentryObservabilityModule.name,
	);

	constructor(
		private readonly config: ConfigService,
		private readonly modulesContainer: ModulesContainer,
	) {}

	onModuleInit(): void {
		initSentry({
			dsn: this.config.get('SENTRY_KEY'),
			tracesSampleRate: 1.0,
			instrumenter: 'otel',
			environment: this.config.get('ENVIRONMENT_NAME') ?? 'local-dev',
			release: this.config.get('RELEASE_VERSION') ?? '0.0.0-development',
		});
		wrapProvidersWithTracingSpans(this.modulesContainer);
		oTelSDK.start();

		this.logger.log('Sentry initialized');
	}
}
