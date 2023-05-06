import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import {
	AuthConfig,
	OAuthModule,
	OAuthService,
	OAuthStorage,
} from 'angular-oauth2-oidc';

import { AuthComponent } from './components/auth.component';
import { AuthService } from './services/auth.service';

@NgModule({
	declarations: [AuthComponent],
	imports: [CommonModule, OAuthModule.forRoot()],
	exports: [AuthComponent],
})
export class AuthModule {
	static forRoot(
		authConfig: AuthConfig,
		discoveryDocumentUrl: string,
	): ModuleWithProviders<AuthModule> {
		return {
			ngModule: AuthModule,
			providers: [
				AuthService,
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
					deps: [OAuthService, AuthService],
					multi: true,
				},
			],
		};
	}
}
