import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { AuthUser } from '@kordis/shared/model';

import { AuthService } from './auth-service';

/**
 * This is a simple implementation of the AuthService which is intended to be used in development.
 * It saves the user and token in the local storage and allows you to set the user manually. There is no OAuth process involved.
 */
@Injectable()
export class DevAuthService implements AuthService {
	readonly isAuthenticated$: Observable<boolean>;
	readonly user$: Observable<AuthUser | null>;
	readonly token$: Observable<string | null>;
	private readonly tokenSubject$ = new BehaviorSubject<string | null>(null);
	private readonly userSubject$ = new BehaviorSubject<AuthUser | null>(null);

	constructor(private readonly router: Router) {
		this.user$ = this.userSubject$.asObservable();
		this.isAuthenticated$ = this.user$.pipe(map((user) => !!user));
		this.token$ = this.tokenSubject$.asObservable();

		const possibleUserSession = localStorage.getItem('krdDevUser');
		if (possibleUserSession) {
			this.userSubject$.next(JSON.parse(possibleUserSession) as AuthUser);
			this.tokenSubject$.next(localStorage.getItem('krdDevToken'));
		}
	}

	setSession(user: AuthUser): void {
		const token = this.createDevJwt(this.authUserToTokenPayload(user));
		localStorage.setItem('krdDevUser', JSON.stringify(user));
		localStorage.setItem('krdDevToken', token);
		this.userSubject$.next(user);
		this.tokenSubject$.next(token);
	}

	login(): void {
		void this.router.navigate(['/auth/dev-login']);
	}

	logout(): void {
		localStorage.removeItem('krdDevUser');
		localStorage.removeItem('krdDevToken');
		this.userSubject$.next(null);
		this.tokenSubject$.next(null);
		void this.router.navigate(['/auth']);
	}

	getAccessToken(): string {
		// eslint-disable-next-line rxjs/no-subject-value
		return this.tokenSubject$.getValue() ?? '';
	}

	private authUserToTokenPayload(authUser: AuthUser): {
		emails: [string];
		oid: string;
		given_name: string;
		family_name: string;
		extension_OrganizationId: string;
		extension_Role: string;
	} {
		return {
			oid: authUser.id,
			emails: [authUser.email],
			given_name: authUser.firstName,
			family_name: authUser.lastName,
			extension_OrganizationId: authUser.organizationId,
			extension_Role: authUser.role,
		};
	}

	private createDevJwt(payload: unknown): string {
		const base64UrlEncode = (str: string): string => {
			const base64 = btoa(str);
			return base64.replace('+', '-').replace('/', '_').replace(/=+$/, '');
		};

		const header = {
			alg: 'none',
			typ: 'JWT',
		};

		const encodedHeader = base64UrlEncode(JSON.stringify(header));
		const encodedPayload = base64UrlEncode(JSON.stringify(payload));
		return `${encodedHeader}.${encodedPayload}.`;
	}
}
