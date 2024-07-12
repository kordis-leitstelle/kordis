import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, ModulesContainer } from '@nestjs/core';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import {
	addOpenTelemetryInstrumentation,
	init as initSentry,
	validateOpenTelemetrySetup,
} from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { SentryExceptionsFilter } from './filters/sentry-exceptions.filter';
import { SentryOTelUserContextInterceptor } from './interceptors/sentry-otel-user-context.interceptor';
import { KORDIS_LOGGER_SERVICE } from './services/kordis-logger-service.interface';
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
	exports: [KORDIS_LOGGER_SERVICE],
})
export class SentryObservabilityModule implements OnModuleInit {
	constructor(
		private readonly config: ConfigService,
		private readonly modulesContainer: ModulesContainer,
	) {}

	onModuleInit(): void {
		initSentry({
			dsn: this.config.get('SENTRY_KEY'),
			tracesSampleRate: 1.0,
			profilesSampleRate: 1.0,
			environment: this.config.get('ENVIRONMENT_NAME') ?? 'local-dev',
			release: this.config.get('RELEASE_VERSION') ?? '0.0.0-development',
			integrations: [nodeProfilingIntegration()],
		});

		addOpenTelemetryInstrumentation(
			new GraphQLInstrumentation(),
			new MongooseInstrumentation(),
			new PinoInstrumentation(),
		);

		validateOpenTelemetrySetup();

		wrapProvidersWithTracingSpans(this.modulesContainer);
	}
}
