import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import {
	BehaviorSubject,
	Observable,
	distinctUntilChanged,
	map,
	shareReplay,
} from 'rxjs';

import AuthUser from '../models/auth-user.model';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	readonly user$: Observable<AuthUser | null>;
	readonly isAuthenticated$: Observable<boolean>;
	readonly isDoneLoading$: Observable<boolean>;
	private readonly isAuthenticatedSubject$ = new BehaviorSubject<boolean>(
		false,
	);
	private readonly isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);

	constructor(private readonly oauthService: OAuthService) {
		this.isAuthenticated$ = this.isAuthenticatedSubject$
			.asObservable()
			.pipe(distinctUntilChanged());
		this.user$ = this.isAuthenticated$.pipe(
			map((isAuthenticated) => {
				if (!isAuthenticated) {
					return null;
				}

				const claims = this.oauthService.getIdentityClaims();
				if (Object.values(claims).length <= 0) {
					return null;
				}

				return {
					firstName: claims['given_name'],
					lastName: claims['family_name'],
					email: claims['emails'][0],
				} as AuthUser;
			}),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
		this.isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();
	}

	init(config: AuthConfig, discoveryDocumentUrl: string): void {
		this.oauthService.configure(config);
		this.oauthService.setupAutomaticSilentRefresh();
		this.oauthService
			.loadDiscoveryDocument(discoveryDocumentUrl)
			.then(() => this.oauthService.tryLoginCodeFlow())
			.then(() => this.isDoneLoadingSubject$.next(true))
			.catch(() => this.isDoneLoadingSubject$.next(true));

		this.oauthService.events.subscribe(() => {
			this.isAuthenticatedSubject$.next(
				this.oauthService.hasValidAccessToken(),
			);
		});
	}

	login(): void {
		this.oauthService.initCodeFlow();
	}

	logout(): void {
		this.oauthService.logOut();
	}
}
