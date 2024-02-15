import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import de from '@angular/common/locales/de';
import { APP_INITIALIZER, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import DOMPurify from 'dompurify';
import { NZ_I18N, de_DE } from 'ng-zorro-antd/i18n';

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
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: !isDevMode(),
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
	providers: [
		{
			provide: APP_INITIALIZER,
			// we need to use a global tt policy here mainly for the ant design icons
			useFactory: () => () => {
				globalThis.trustedTypes.createPolicy('default', {
					// https://github.com/angular/angular/issues/31329 can't use Angular DomSanitizer here
					createHTML: (s) => {
						return DOMPurify.sanitize(
							s
								// hack so chrome won't complain about inline styles (mainly from svg icons)
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
		{ provide: NZ_I18N, useValue: de_DE },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
