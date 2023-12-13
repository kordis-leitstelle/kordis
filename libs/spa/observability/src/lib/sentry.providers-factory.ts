import { APP_INITIALIZER, ErrorHandler, Provider } from '@angular/core';
import { Router } from '@angular/router';
import {
	BrowserTracing,
	createErrorHandler,
	init as initSentry,
	instrumentAngularRouting,
	Replay,
	TraceService,
} from '@sentry/angular-ivy';

import {
	NoopObservabilityService,
	OBSERVABILITY_SERVICE,
	SentryObservabilityService,
} from './services/sentry-observability.service';

export function getSentryProviders(
	dsn: string,
	environment: string,
	release: string,
): Provider[] {
	return [
		{
			provide: APP_INITIALIZER,
			useFactory: () => () => {
				startSentry(dsn, environment, release);
			},
			multi: true,
		},
		{
			provide: ErrorHandler,
			useValue: createErrorHandler(),
		},
		{
			provide: TraceService,
			deps: [Router],
		},
		// make sure trace service gets initialized
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
	];
}

export function getNoopSentryProviders(): Provider[] {
	return [
		{
			provide: OBSERVABILITY_SERVICE,
			useClass: NoopObservabilityService,
		},
	];
}

function startSentry(dsn: string, environment: string, release: string): void {
	initSentry({
		dsn,
		integrations: [
			new BrowserTracing({
				routingInstrumentation: instrumentAngularRouting,
			}),
			new Replay({
				maskAllText: true,
				maskAllInputs: true,
			}),
		],
		environment,
		release,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
	});
}
