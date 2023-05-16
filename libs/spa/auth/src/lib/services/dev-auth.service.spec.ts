import { Router } from '@angular/router';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import { firstValueFrom } from 'rxjs';

import { DevAuthService } from './dev-auth.service';

describe('DevAuthService', () => {
	let spectator: SpectatorService<DevAuthService>;
	let routerSpy: Router;

	const createService = createServiceFactory({
		service: DevAuthService,
		mocks: [Router],
	});

	beforeEach(() => {
		routerSpy = createService().inject(Router);
		spectator = createService();
	});

	afterEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
	});

	it('should be created', () => {
		expect(spectator.service).toBeTruthy();
	});

	describe('setSession', () => {
		it('should save the user and token in local storage and set the user and token subjects', async () => {
			const user = {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				id: '1234',
			};
			spectator.service.setSession(user);
			expect(localStorage.getItem('krdDevUser')).toBe(JSON.stringify(user));
			expect(localStorage.getItem('krdDevToken')).toBeDefined();

			await expect(firstValueFrom(spectator.service.user$)).resolves.toEqual(
				user,
			);
			await expect(
				firstValueFrom(spectator.service.token$),
			).resolves.toBeDefined();
		});
	});

	describe('logout', () => {
		it('should remove the user and token from local storage and set the user and token subjects to null', async () => {
			localStorage.setItem('krdDevUser', JSON.stringify({ id: '1234' }));
			localStorage.setItem('krdDevToken', 'token');
			spectator.service.logout();
			expect(localStorage.getItem('krdDevUser')).toBeNull();
			expect(localStorage.getItem('krdDevToken')).toBeNull();
			await expect(firstValueFrom(spectator.service.user$)).resolves.toBeNull();
			await expect(
				firstValueFrom(spectator.service.token$),
			).resolves.toBeNull();
		});
	});

	describe('login', () => {
		it('should navigate to the dev login page', () => {
			spectator.service.login();
			expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/dev-login']);
		});
	});
});
