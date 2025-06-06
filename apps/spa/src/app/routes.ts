import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { switchMap } from 'rxjs';

import { AUTH_SERVICE, authGuard } from '@kordis/spa/core/auth';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full',
	},
	{
		path: 'auth',
		loadChildren: () =>
			import('@kordis/spa/view/auth').then((m) => m.AuthViewModule),
		canActivate: [
			() => {
				const auth = inject(AUTH_SERVICE);
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
		path: 'dashboard',
		loadComponent: () =>
			import('@kordis/spa/view/dashboard').then((m) => m.DashboardComponent),
		canActivate: [authGuard],
	},
	{
		path: 'action-map',
		loadComponent: () =>
			import('@kordis/spa/view/map').then((m) => m.MapComponent),
		canActivate: [authGuard],
	},
	{ path: '**', redirectTo: 'dashboard' },
];

export default routes;
