import { ReactiveFormsModule } from '@angular/forms';
import { createMock } from '@golevelup/ts-jest';
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator/jest';
import { NzButtonComponent } from 'ng-zorro-antd/button';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';
import { DevLoginComponent } from './dev-login.component';

describe('DevLoginComponent', () => {
	let spectator: SpectatorRouting<DevLoginComponent>;
	const authServiceMock = createMock<DevAuthService>();
	const createComponent = createRoutingFactory({
		component: DevLoginComponent,
		imports: [ReactiveFormsModule, NzButtonComponent],
		componentProviders: [
			{
				provide: AUTH_SERVICE,
				useValue: authServiceMock,
			},
		],
	});

	beforeEach(() => (spectator = createComponent()));
	afterEach(() => jest.clearAllMocks());

	it('should login as test user when loginAsTestuser is called', () => {
		spectator.component.loginAsTestuser(0);
		expect(spectator.router.navigate).toHaveBeenCalledWith(['/']);
	});

	it('should not login with custom claims when form is invalid', () => {
		const alertSpy = jest.spyOn(window, 'alert');
		alertSpy.mockImplementation();

		spectator.component.loginWithCustomClaims();
		expect(alertSpy).toHaveBeenCalledWith('Please fill out all claim fields');
		expect(authServiceMock.setSession).not.toHaveBeenCalled();
		expect(spectator.router.navigate).not.toHaveBeenCalled();
	});

	it('should login with custom claims when form is valid', () => {
		spectator.component.customClaimsForm.setValue({
			id: '1234',
			firstName: 'Test',
			lastName: 'User 1',
			email: 'testuser@test.com',
		});
		spectator.component.loginWithCustomClaims();
		expect(authServiceMock.setSession).toHaveBeenCalledWith({
			id: '1234',
			firstName: 'Test',
			lastName: 'User 1',
			email: 'testuser@test.com',
		});
		expect(spectator.router.navigate).toHaveBeenCalledWith(['/']);
	});
});
