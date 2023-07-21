import { createMock } from '@golevelup/ts-jest';
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { AUTH_SERVICE, DevAuthService } from '@kordis/spa/auth';
import { GraphqlService } from '@kordis/spa/graphql';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
	let spectator: SpectatorRouting<AppComponent>;
	const gqlService = createMock<GraphqlService>();
	const createComponent = createRoutingFactory({
		component: AppComponent,
		providers: [
			{
				provide: AUTH_SERVICE,
				useValue: createMock<DevAuthService>({
					isAuthenticated$: of(true),
				}),
			},
			{
				provide: GraphqlService,
				useValue: gqlService,
			},
		],
	});

	it('should logout user deactivated subscription event', () => {
		gqlService.subscribe$.mockImplementationOnce(() =>
			of({
				data: {
					currentUserDeactivated: {
						userId: 'test',
					},
				},
			}),
		);
		spectator = createComponent();
		const authService = spectator.inject(AUTH_SERVICE, true);
		const logoutSpy = jest.spyOn(authService, 'logout');
		expect(logoutSpy).toHaveBeenCalled();
	});
});
