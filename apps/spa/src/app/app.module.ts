import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AuthModule, DevAuthModule, authGuard } from '@kordis/spa/auth';

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
		environment.oauth
			? AuthModule.forRoot(
					environment.oauth.config,
					environment.oauth.discoveryDocumentUrl,
			  )
			: DevAuthModule.forRoot(),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
