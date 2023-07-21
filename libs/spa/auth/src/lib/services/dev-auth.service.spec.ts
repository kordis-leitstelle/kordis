import { Router } from '@angular/router';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { firstValueFrom } from 'rxjs';

import { Role } from '@kordis/shared/auth';

import { DevAuthService } from './dev-auth.service';

describe('DevAuthService', () => {
	const createService = createServiceFactory({
		service: DevAuthService,
		mocks: [Router],
	});

	afterEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
	});

	it('should set user from local storage session', async () => {
		const user = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'johndoe@example.com',
			id: '1234',
			role: Role.USER,
			organizationId: '1234',
		};
		localStorage.setItem('krdDevUser', JSON.stringify(user));
		localStorage.setItem('krdDevToken', 'token');

		const spectator = createService();
		await expect(firstValueFrom(spectator.service.token$)).resolves.toBe(
			'token',
		);
		await expect(firstValueFrom(spectator.service.user$)).resolves.toEqual(
			user,
		);
	});

	it('should save the user and token in local storage and set the user and token subjects', async () => {
		const spectator = createService();

		const user = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'johndoe@example.com',
			id: '1234',
			role: Role.USER,
			organizationId: '1234',
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

	it('should remove the user and token from local storage and set the user and token subjects to null', async () => {
		const spectator = createService();

		localStorage.setItem('krdDevUser', JSON.stringify({ id: '1234' }));
		localStorage.setItem('krdDevToken', 'token');
		spectator.service.logout();
		expect(localStorage.getItem('krdDevUser')).toBeNull();
		expect(localStorage.getItem('krdDevToken')).toBeNull();
		await expect(firstValueFrom(spectator.service.user$)).resolves.toBeNull();
		await expect(firstValueFrom(spectator.service.token$)).resolves.toBeNull();
	});

	it('should navigate to the dev login page', () => {
		const spectator = createService();
		const routerSpy = spectator.inject(Router);
		spectator.service.login();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/dev-login']);
	});
});
