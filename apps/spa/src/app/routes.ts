import { Routes } from '@angular/router';

import { authGuard } from '@kordis/spa/auth';
import { DashboardComponent } from '@kordis/spa/dashboard';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashbaord',
		pathMatch: 'full',
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [authGuard],
	},
	{ path: '**', redirectTo: 'dashboard' },
];

export default routes;
