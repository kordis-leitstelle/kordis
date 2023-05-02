import { Inject, Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import {
	BehaviorSubject,
	Observable,
	distinctUntilChanged,
	map,
	shareReplay,
} from 'rxjs';

import { AuthUser } from '@kordis/shared/auth';
import {
	OBSERVABILITY_SERVICE,
	ObservabilityService,
} from '@kordis/spa/observability';

import { AuthService } from './auth-service';

@Injectable()
export class ProdAuthService implements AuthService {
	readonly user$: Observable<AuthUser | null>;
	readonly isAuthenticated$: Observable<boolean>;
	private readonly isAuthenticatedSubject$ = new BehaviorSubject<boolean>(
		false,
	);

	constructor(
		private readonly oauthService: OAuthService,
		@Inject(OBSERVABILITY_SERVICE) observabilityService: ObservabilityService,
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
				};
			}),
			shareReplay({ bufferSize: 1, refCount: true }),
		);

		this.user$.subscribe((user) =>
			observabilityService.setUser(
				user?.id,
				user?.email,
				`${user?.firstName} ${user?.lastName}`,
			),
		);
	}

	login(): void {
		this.oauthService.initCodeFlow();
	}

	logout(): void {
		this.oauthService.logOut();
	}
}
