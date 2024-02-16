import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
	APP_INITIALIZER,
	ModuleWithProviders,
	NgModule,
	inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginOutline } from '@ant-design/icons-angular/icons';
import {
	AuthConfig,
	DefaultOAuthInterceptor,
	OAuthModule,
	OAuthService,
	OAuthStorage,
} from 'angular-oauth2-oidc';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzContentComponent, NzLayoutComponent } from 'ng-zorro-antd/layout';
import { switchMap } from 'rxjs';

import { AuthComponent } from './components/auth.component';
import { AADB2COAuthService } from './services/aadb2c-oauth.service';
import { AUTH_SERVICE } from './services/auth-service';

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
		NzContentComponent,
		NzLayoutComponent,
		NzButtonComponent,
		NzIconModule.forChild([LoginOutline]),
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
