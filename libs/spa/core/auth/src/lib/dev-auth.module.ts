import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DevLoginComponent } from './components/dev-login.component';
import { DevAuthInterceptor } from './interceptors/dev-auth.interceptor';
import { AUTH_SERVICE } from './services/auth-service';
import { DevAuthService } from './services/dev-auth.service';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: 'auth/dev-login',
				component: DevLoginComponent,
			},
		]),
	],
	exports: [RouterModule],
})
export class DevAuthModule {
	static forRoot(): ModuleWithProviders<DevAuthModule> {
		return {
			ngModule: DevAuthModule,
			providers: [
				{
					provide: AUTH_SERVICE,
					useClass: DevAuthService,
				},
				{
					provide: HTTP_INTERCEPTORS,
					useClass: DevAuthInterceptor,
					multi: true,
				},
			],
		};
	}
}
