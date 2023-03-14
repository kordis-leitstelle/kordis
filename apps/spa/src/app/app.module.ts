import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AuthGuard } from '@kordis/spa/auth';

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
		loadComponent: () =>
			import('@kordis/spa/auth').then((mod) => mod.AuthComponent),
	},
	{
		path: 'protected',
		component: ProtectedComponent,
		canActivate: [AuthGuard],
	},
	{ path: '**', redirectTo: 'protected' },
];

@NgModule({
	declarations: [AppComponent, ProtectedComponent],
	imports: [
		BrowserModule,
		OAuthModule.forRoot(),
		HttpClientModule,
		RouterModule.forRoot(routes),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
