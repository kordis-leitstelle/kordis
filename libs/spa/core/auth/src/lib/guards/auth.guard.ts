import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { AUTH_SERVICE } from '../services/auth-service';

export const authGuard: CanActivateFn = () => {
	const authService = inject(AUTH_SERVICE);
	const router = inject(Router);

	return authService.isAuthenticated$.pipe(
		switchMap(async (isAuthenticated) => {
			if (!isAuthenticated) {
				await router.navigate(['/auth']);
			}

			return isAuthenticated;
		}),
	);
};
