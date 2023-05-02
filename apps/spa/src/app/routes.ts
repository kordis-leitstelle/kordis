import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthComponent, AuthService, authGuard } from '@kordis/spa/auth';

import { ProtectedComponent } from './component/protected.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'protected',
		pathMatch: 'full',
	},
	{
		path: 'auth',
		component: AuthComponent,
		canActivate: [
			() => {
				const auth = inject(AuthService);
				const router = inject(Router);

				return auth.isAuthenticated$.pipe(
					switchMap(async (isAuthenticated) =>
						isAuthenticated ? router.navigate(['/protected']) : true,
					),
				);
			},
		],
	},
	{
		path: 'protected',
		component: ProtectedComponent,
		canActivate: [authGuard],
	},
	{ path: '**', redirectTo: 'protected' },
];

export default routes;
