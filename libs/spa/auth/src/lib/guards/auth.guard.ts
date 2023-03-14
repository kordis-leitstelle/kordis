import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
	) {}

	canActivate(): Observable<boolean> {
		return this.authService.isAuthenticated$.pipe(
			switchMap(async (isAuthenticated) => {
				if (!isAuthenticated) {
					await this.router.navigate(['/auth']);
				}

				return isAuthenticated;
			}),
		);
	}
}
