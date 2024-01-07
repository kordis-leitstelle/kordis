import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import de from '@angular/common/locales/de';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import DOMPurify from 'dompurify';
import { NZ_I18N, de_DE } from 'ng-zorro-antd/i18n';
import { firstValueFrom } from 'rxjs';

import { AuthModule, DevAuthModule } from '@kordis/spa/auth';
import {
	NoopObservabilityModule,
	SentryObservabilityModule,
} from '@kordis/spa/observability';

import { environment } from '../environments/environment';
import { AppComponent } from './component/app.component';
import { ProtectedComponent } from './component/protected.component';
import routes from './routes';

registerLocaleData(de);

@NgModule({
	declarations: [AppComponent, ProtectedComponent],
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes),
		HttpClientModule,
		environment.oauth
			? AuthModule.forRoot(
					environment.oauth.config,
					environment.oauth.discoveryDocumentUrl,
				)
			: DevAuthModule.forRoot(),
		// for now, we accept that we have the sentry module and dependencies in our dev bundle as well
		environment.sentryKey
			? SentryObservabilityModule.forRoot(
					environment.sentryKey,
					environment.environmentName,
					environment.releaseVersion,
				)
			: NoopObservabilityModule.forRoot(),
	],
	providers: [
		{
			provide: APP_INITIALIZER,
			// we need to use a global tt policy here mainly for the ant design icons
			useFactory: () => async () => {
				globalThis.trustedTypes.createPolicy('default', {
					// https://github.com/angular/angular/issues/31329 can't use Angular DomSanitizer here
					createHTML: (s) => {
						return DOMPurify.sanitize(
							s
								// hack until https://github.com/cure53/DOMPurify/issues/900 figured out
								.replace('<style />', ''),
							{
								USE_PROFILES: { html: true, svg: true },
							},
						);
					},
				});
			},
			multi: true,
		},
		{
			provide: APP_INITIALIZER,
			useFactory: (http: HttpClient) => async () => {
				const config = await firstValueFrom(http.get('./assets/config.json'));
				return Object.assign(environment, { ...config, ...environment });
			},
			deps: [HttpClient],
			multi: true,
		},
		{ provide: NZ_I18N, useValue: de_DE },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
