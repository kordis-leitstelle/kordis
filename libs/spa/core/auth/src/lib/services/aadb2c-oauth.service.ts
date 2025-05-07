import { Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import {
	BehaviorSubject,
	Observable,
	distinctUntilChanged,
	map,
	shareReplay,
} from 'rxjs';

import { AuthUser, Role } from '@kordis/shared/model';

import { AuthService } from './auth-service';

@Injectable()
export class AADB2COAuthService implements AuthService {
	readonly user$: Observable<AuthUser | null>;
	readonly user: Signal<AuthUser | null>;
	readonly isAuthenticated$: Observable<boolean>;

	private readonly isAuthenticatedSubject$ = new BehaviorSubject<boolean>(
		false,
	);

	constructor(
		private readonly oauthService: OAuthService,
		private readonly router: Router,
	) {
		this.isAuthenticated$ = this.isAuthenticatedSubject$
			.asObservable()
			.pipe(distinctUntilChanged());

		this.oauthService.events.subscribe(() => {
			this.isAuthenticatedSubject$.next(
				this.oauthService.hasValidAccessToken(),
			);
		});

		this.user$ = this.isAuthenticated$.pipe(
			map((isAuthenticated): AuthUser | null => {
				if (!isAuthenticated) {
					return null;
				}

				const claims = this.oauthService.getIdentityClaims();
				if (Object.values(claims).length <= 0) {
					return null;
				}

				return {
					id: claims['oid'] || claims['sub'],
					firstName: claims['given_name'],
					lastName: claims['family_name'],
					email: claims['emails']?.[0],
					role: claims['extension_Role'] as Role,
					organizationId: claims['extension_OrganizationId'],
				};
			}),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
		this.user = toSignal(this.user$, { initialValue: null });
	}

	login(): void {
		this.oauthService.initCodeFlow();
	}

	logout(): void {
		this.oauthService.logOut();
		void this.router.navigate(['/auth']);
	}

	getAccessToken(): string {
		return this.oauthService.getAccessToken();
	}
}
