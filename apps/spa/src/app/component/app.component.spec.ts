import { createMock } from '@golevelup/ts-jest';
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator/jest';
import { ReplaySubject, of } from 'rxjs';

import { AUTH_SERVICE, DevAuthService } from '@kordis/spa/auth';
import { GraphqlService } from '@kordis/spa/graphql';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
	let spectator: SpectatorRouting<AppComponent>;
	const gqlService = createMock<GraphqlService>();
	const isAuthenticatedStatusSubject$ = new ReplaySubject<boolean>(1);

	const createComponent = createRoutingFactory({
		component: AppComponent,
		providers: [
			{
				provide: AUTH_SERVICE,
				useValue: createMock<DevAuthService>({
					isAuthenticated$: isAuthenticatedStatusSubject$.asObservable(),
				}),
			},
			{
				provide: GraphqlService,
				useValue: gqlService,
			},
		],
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should logout user on deactivated subscription event', () => {
		gqlService.subscribe$.mockImplementationOnce(() =>
			of({
				data: {
					currentUserDeactivated: {
						userId: 'test',
					},
				},
			}),
		);
		isAuthenticatedStatusSubject$.next(true);
		spectator = createComponent();
		const authService = spectator.inject(AUTH_SERVICE, true);
		const logoutSpy = jest.spyOn(authService, 'logout');
		expect(logoutSpy).toHaveBeenCalled();
	});

	it('should not logout on deactivated subscription event while not authenticated', () => {
		gqlService.subscribe$.mockImplementationOnce(() =>
			of({
				data: {
					currentUserDeactivated: {
						userId: 'test',
					},
				},
			}),
		);
		isAuthenticatedStatusSubject$.next(false);
		spectator = createComponent();
		const authService = spectator.inject(AUTH_SERVICE, true);
		const logoutSpy = jest.spyOn(authService, 'logout');
		expect(logoutSpy).not.toHaveBeenCalled();
	});
});
