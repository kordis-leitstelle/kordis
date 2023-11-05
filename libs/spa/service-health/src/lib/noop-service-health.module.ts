import { NgModule } from '@angular/core';
import { SERVICE_HEALTH_SERVICE } from './service-health.service';
import { of } from 'rxjs';

@NgModule({
	providers: [
		{
			provide: SERVICE_HEALTH_SERVICE,
			useValue: {
				serviceStatusChanged$: of(),
			},
		},
	],
})
export class NoopServiceHealthModule {}
