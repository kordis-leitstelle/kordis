import { HttpClientModule } from '@angular/common/http';
import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule, Routes } from '@angular/router';
import { switchMap } from 'rxjs';

import {
	AuthComponent,
	AuthModule,
	AuthService,
	authGuard,
} from '@kordis/spa/auth';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ProtectedComponent } from './protected.component';

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

@NgModule({
	declarations: [AppComponent, ProtectedComponent],
	imports: [
		BrowserModule,
		HttpClientModule,
		RouterModule.forRoot(routes),
		AuthModule.forRoot(
			environment.oauth.config,
			environment.oauth.discoveryDocumentUrl,
		),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
