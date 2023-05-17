import { Routes } from '@angular/router';

import { authGuard } from '@kordis/spa/auth';

import { ProtectedComponent } from './component/protected.component';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'protected',
		pathMatch: 'full',
	},
	{
		path: 'protected',
		component: ProtectedComponent,
		canActivate: [authGuard],
	},
	{ path: '**', redirectTo: 'protected' },
];

export default routes;
