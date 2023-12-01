import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import type { ModuleWithProviders } from '@angular/core';
import { APP_INITIALIZER, inject, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import type { AuthConfig } from 'angular-oauth2-oidc';
import {
	DefaultOAuthInterceptor,
	OAuthModule,
	OAuthService,
	OAuthStorage,
} from 'angular-oauth2-oidc';
import { switchMap } from 'rxjs';

import { AuthComponent } from './components/auth.component';
import { AUTH_SERVICE } from './services/auth-service';
import { ProdAuthService } from './services/auth.service';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: 'auth',
				component: AuthComponent,
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
		]),
		NgOptimizedImage,
	],
	declarations: [AuthComponent],
	exports: [AuthComponent, RouterModule],
})
export class BaseAuthModule {}

@NgModule({
	imports: [CommonModule, BaseAuthModule, OAuthModule.forRoot()],
	exports: [RouterModule],
})
export class AuthModule {
	static forRoot(
		authConfig: AuthConfig,
		discoveryDocumentUrl: string,
	): ModuleWithProviders<AuthModule> {
		return {
			ngModule: AuthModule,
			providers: [
				{
					provide: AUTH_SERVICE,
					useClass: ProdAuthService,
				},
				{
					provide: OAuthStorage,
					useFactory: () => localStorage,
				},
				{
					provide: APP_INITIALIZER,
					useFactory: (oauthService: OAuthService) => {
						return async () => {
							oauthService.configure(authConfig);
							oauthService.setupAutomaticSilentRefresh();
							await oauthService.loadDiscoveryDocument(discoveryDocumentUrl);
							await oauthService.tryLoginCodeFlow();
						};
					},
					deps: [OAuthService, AUTH_SERVICE],
					multi: true,
				},
				{
					provide: HTTP_INTERCEPTORS,
					useClass: DefaultOAuthInterceptor,
					multi: true,
				},
			],
		};
	}
}
