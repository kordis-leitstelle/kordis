import { CommonModule } from '@angular/common';
import {
	APP_INITIALIZER,
	ErrorHandler,
	ModuleWithProviders,
	NgModule,
} from '@angular/core';
import { Router } from '@angular/router';
import {
	BrowserTracing,
	Replay,
	TraceService,
	createErrorHandler,
	init as initSentry,
	instrumentAngularRouting,
} from '@sentry/angular-ivy';

import {
	OBSERVABILITY_SERVICE,
	SentryObservabilityService,
} from './sentry-observability.service';

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
				{
					provide: APP_INITIALIZER,
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					useFactory: () => () => {},
					deps: [TraceService],
					multi: true,
				},
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
			integrations: [
				new BrowserTracing({
					routingInstrumentation: instrumentAngularRouting,
				}),
				new Replay(),
			],
			environment,
			release,
			tracesSampleRate: 1.0,
			replaysSessionSampleRate: 0.1,
			replaysOnErrorSampleRate: 1.0,
		});
	}
}
