import { Injectable, InjectionToken } from '@angular/core';
import { setUser as sentrySetUser } from '@sentry/angular-ivy';

export interface ObservabilityService {
	setUser(id?: string, email?: string, name?: string): void;
}

export const OBSERVABILITY_SERVICE = new InjectionToken<ObservabilityService>(
	'OBSERVABILITY_SERVICE',
);

@Injectable()
export class SentryObservabilityService implements ObservabilityService {
	setUser(id?: string, email?: string, username?: string): void {
		if (!id) {
			sentrySetUser(null);
		} else {
			sentrySetUser({
				id,
				email,
				username,
			});
		}
	}
}
