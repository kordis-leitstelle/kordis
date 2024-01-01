import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ServiceStatusReport } from '../models/service-status-report.model';

export const SERVICE_HEALTH_SERVICE = new InjectionToken<ServiceHealthService>(
	'SERVICE_HEALTH_SERVICE',
);

export interface ServiceHealthService {
	serviceStatusChanged$: Observable<ServiceStatusReport>;
}
