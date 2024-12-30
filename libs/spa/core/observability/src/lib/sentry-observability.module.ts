import { CommonModule } from '@angular/common';
import {
	ErrorHandler,
	ModuleWithProviders,
	NgModule,
	inject,
	provideAppInitializer,
} from '@angular/core';
import { Router } from '@angular/router';
import {
	TraceService,
	browserTracingIntegration,
	createErrorHandler,
	init as initSentry,
	replayIntegration,
} from '@sentry/angular';

import {
	OBSERVABILITY_SERVICE,
	SentryObservabilityService,
} from './services/sentry-observability.service';

@NgModule({
	imports: [CommonModule],
})
export class SentryObservabilityModule {
	static forRoot(
		sentryKey: string,
		environment: string,
		release: string,
	): ModuleWithProviders<SentryObservabilityModule> {
		this.startSentry(sentryKey, environment, release);

		return {
			ngModule: SentryObservabilityModule,
			providers: [
				{
					provide: ErrorHandler,
					useValue: createErrorHandler(),
				},
				{
					provide: TraceService,
					deps: [Router],
				},
				provideAppInitializer(() => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
					const initializerFn = ((_: TraceService) => () => {})(
						inject(TraceService),
					);
					return initializerFn();
				}),
				{
					provide: OBSERVABILITY_SERVICE,
					useClass: SentryObservabilityService,
				},
			],
		};
	}

	private static startSentry(
		dsn: string,
		environment: string,
		release: string,
	): void {
		initSentry({
			dsn,
			integrations: [browserTracingIntegration(), replayIntegration()],
			environment,
			release,
			tracesSampleRate: 1.0,
			replaysSessionSampleRate: 0.1,
			replaysOnErrorSampleRate: 1.0,
		});
	}
}
