import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputDirective } from 'ng-zorro-antd/input';

import { BaseAuthModule } from './auth.module';
import { DevLoginComponent } from './components/dev-login.component';
import { DevAuthInterceptor } from './interceptors/dev-auth.interceptor';
import { AUTH_SERVICE } from './services/auth-service';
import { DevAuthService } from './services/dev-auth.service';

@NgModule({
	declarations: [DevLoginComponent],
	imports: [
		CommonModule,
		BaseAuthModule,
		ReactiveFormsModule,
		RouterModule.forChild([
			{
				path: 'auth/dev-login',
				component: DevLoginComponent,
			},
		]),
		NzButtonComponent,
		NzInputDirective,
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
