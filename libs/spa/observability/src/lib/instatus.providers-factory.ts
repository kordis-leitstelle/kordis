import { DatePipe } from '@angular/common';
import { Provider } from '@angular/core';
import { InstatusServiceHealthService } from './services/instatus-service-health.service';
import { of } from 'rxjs';
import { SERVICE_HEALTH_SERVICE } from './services/service-health.service';

export function getInstatusProviders(
	url: string,
	checkIntervalMs: number,
): Provider[] {
	return [
		DatePipe,
		{
			provide: SERVICE_HEALTH_SERVICE,
			useFactory: () => new InstatusServiceHealthService(url, checkIntervalMs),
		},
	];
}

export function getNoopInstatusProviders(): Provider[] {
	return [
		{
			provide: SERVICE_HEALTH_SERVICE,
			useValue: {
				serviceStatusChanged$: of(),
			},
		},
	];
}
