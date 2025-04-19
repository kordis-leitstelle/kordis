import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthUser } from '@kordis/shared/model';

export interface AuthService {
	readonly user$: Observable<AuthUser | null>;
	readonly user: Signal<AuthUser | null>;
	readonly isAuthenticated$: Observable<boolean>;

	login(): void;

	logout(): void;

	getAccessToken(): string;
}

export const AUTH_SERVICE = new InjectionToken<AuthService>('AUTH_SERVICE');
