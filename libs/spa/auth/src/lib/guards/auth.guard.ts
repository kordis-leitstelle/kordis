import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
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
