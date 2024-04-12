import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
	AuthConfig,
	DefaultOAuthInterceptor,
	OAuthModule,
	OAuthService,
	OAuthStorage,
} from 'angular-oauth2-oidc';

import { AADB2COAuthService } from './services/aadb2c-oauth.service';
import { AUTH_SERVICE } from './services/auth-service';

@NgModule({
	imports: [CommonModule, OAuthModule.forRoot()],
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
					useClass: AADB2COAuthService,
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
