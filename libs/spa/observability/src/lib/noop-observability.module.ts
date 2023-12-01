import { CommonModule } from '@angular/common';
import type { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';

import {
	NoopObservabilityService,
	OBSERVABILITY_SERVICE,
} from './services/sentry-observability.service';

@NgModule({
	imports: [CommonModule],
})
export class NoopObservabilityModule {
	static forRoot(): ModuleWithProviders<NoopObservabilityModule> {
		return {
			ngModule: NoopObservabilityModule,
			providers: [
				{
					provide: OBSERVABILITY_SERVICE,
					useClass: NoopObservabilityService,
				},
			],
		};
	}
}
