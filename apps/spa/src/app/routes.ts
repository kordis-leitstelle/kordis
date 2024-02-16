import { Routes } from '@angular/router';

import { authGuard } from '@kordis/spa/auth';
import { loadDashboardView } from '@kordis/spa/views/dashboard';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full',
	},
	{
		path: 'dashboard',
		loadComponent: loadDashboardView,
		canActivate: [authGuard],
	},
	{ path: '**', redirectTo: 'dashboard' },
];

export default routes;
