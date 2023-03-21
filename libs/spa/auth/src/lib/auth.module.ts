import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { AuthConfig, OAuthModule, OAuthService } from 'angular-oauth2-oidc';

import { AuthComponent } from './components/auth.component';
import { AuthService } from './services/auth.service';

const PROVIDERS = Object.freeze([AuthService]);

@NgModule({
	declarations: [AuthComponent],
	imports: [CommonModule, OAuthModule.forRoot()],
	exports: [AuthComponent],
	providers: [...PROVIDERS],
})
export class AuthModule {
	static forRoot(
		authConfig: AuthConfig,
		discoveryDocumentUrl: string,
	): ModuleWithProviders<AuthModule> {
		return {
			ngModule: AuthModule,
			providers: [
				...PROVIDERS,
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
