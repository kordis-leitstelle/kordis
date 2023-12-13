import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
	getNoopSentryProviders,
	getSentryProviders,
} from './sentry.providers-factory';
import {
	getInstatusProviders,
	getNoopInstatusProviders,
} from './instatus.providers-factory';

@NgModule({
	imports: [CommonModule],
})
export class ObservabilityModule {
	static forRoot(
		sentry?: {
			dsn: string;
			environment: string;
			release: string;
		},
		instatus?: {
			url: string;
			checkIntervalMs: number;
		},
	): ModuleWithProviders<ObservabilityModule> {
		return {
			ngModule: ObservabilityModule,
			providers: [
				...(sentry
					? getSentryProviders(sentry.dsn, sentry.environment, sentry.release)
					: getNoopSentryProviders()),
				...(instatus
					? getInstatusProviders(instatus.url, instatus.checkIntervalMs)
					: getNoopInstatusProviders()),
			],
		};
	}
}
