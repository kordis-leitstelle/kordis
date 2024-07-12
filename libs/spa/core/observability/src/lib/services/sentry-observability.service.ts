import { Inject, Injectable, InjectionToken } from '@angular/core';
import { setUser as sentrySetUser } from '@sentry/angular';

import { AUTH_SERVICE, AuthService } from '@kordis/spa/core/auth';

export interface ObservabilityService {
	setUser(id?: string, email?: string, name?: string): void;
}

export const OBSERVABILITY_SERVICE = new InjectionToken<ObservabilityService>(
	'OBSERVABILITY_SERVICE',
);

@Injectable()
export class SentryObservabilityService implements ObservabilityService {
	constructor(@Inject(AUTH_SERVICE) private readonly authService: AuthService) {
		this.subscribeToUserChanges();
	}

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

	private subscribeToUserChanges(): void {
		this.authService.user$.subscribe((user) => {
			this.setUser(
				user?.id,
				user?.email,
				`${user?.firstName} ${user?.lastName}`,
			);
		});
	}
}

@Injectable()
export class NoopObservabilityService implements ObservabilityService {
	setUser(): void {
		// noop
	}
}
