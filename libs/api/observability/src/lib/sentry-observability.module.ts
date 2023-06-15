import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, ModulesContainer } from '@nestjs/core';
import { init as initSentry } from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

import { SentryOTelUserContextInterceptor } from './interceptors/sentry-otel-user-context.interceptor';
import oTelSDK from './oTelSdk';
import { wrapProvidersWithTracingSpans } from './trace-wrapper';

// This Module must come after the AuthModule, because it depends on the use set by the AuthInterceptor
@Module({
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: SentryOTelUserContextInterceptor,
		},
	],
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
			instrumenter: 'otel',
			environment: this.config.get('ENVIRONMENT_NAME') ?? 'local-dev',
			release: this.config.get('RELEASE_VERSION') ?? '0.0.0-development',
			integrations: [new ProfilingIntegration()],
		});
		wrapProvidersWithTracingSpans(this.modulesContainer);
		oTelSDK.start();
	}
}
