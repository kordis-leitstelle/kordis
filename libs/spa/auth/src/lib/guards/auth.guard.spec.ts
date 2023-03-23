import { TestBed } from '@angular/core/testing';
import {
	ActivatedRouteSnapshot,
	NavigationExtras,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { createMock } from '@golevelup/ts-jest';
import { Observable, ReplaySubject, Subject, firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('AuthGuard', () => {
	let isAuthenticatedSubject$: Subject<boolean>;
	let authServiceMock: AuthService;
	let routerMock: Router;
	beforeEach(() => {
		isAuthenticatedSubject$ = new ReplaySubject<boolean>(1);
		authServiceMock = createMock<AuthService>({
			isAuthenticated$: isAuthenticatedSubject$.asObservable(),
		});
		routerMock = createMock<Router>({
			async navigate(
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				commands: unknown[],
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				extras?: NavigationExtras,
			): Promise<boolean> {
				return true;
			},
		});

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		});
	});

	it('should return true', () => {
		isAuthenticatedSubject$.next(true);
		TestBed.runInInjectionContext(() => {
			expect(
				firstValueFrom(
					authGuard(
						null as unknown as ActivatedRouteSnapshot,
						null as unknown as RouterStateSnapshot,
					) as Observable<boolean>,
				),
			).resolves.toBeTruthy();
		});
	});

	it('should return false and navigate to auth', () => {
		isAuthenticatedSubject$.next(false);
		TestBed.runInInjectionContext(() => {
			expect(
				firstValueFrom(
					authGuard(
						null as unknown as ActivatedRouteSnapshot,
						null as unknown as RouterStateSnapshot,
					) as Observable<boolean>,
				),
			).resolves.toBeFalsy();
		});

		expect(routerMock.navigate).toHaveBeenCalledWith(['/auth']);
	});
});
