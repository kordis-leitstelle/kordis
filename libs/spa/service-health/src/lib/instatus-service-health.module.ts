import { CommonModule, DatePipe } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { InstatusServiceHealthService } from './instatus-service-health.service';
import { SERVICE_HEALTH_SERVICE } from './service-health.service';

@NgModule({
	imports: [CommonModule],
})
export class InstatusServiceHealthModule {
	static forRoot(
		instatusUrl: string,
		checkIntervalMs = 30000,
	): ModuleWithProviders<InstatusServiceHealthModule> {
		return {
			ngModule: InstatusServiceHealthModule,
			providers: [
				DatePipe,
				{
					provide: SERVICE_HEALTH_SERVICE,
					useFactory: () =>
						new InstatusServiceHealthService(instatusUrl, checkIntervalMs),
				},
			],
		};
	}
}
