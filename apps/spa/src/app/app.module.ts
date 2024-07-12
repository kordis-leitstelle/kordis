import { registerLocaleData } from '@angular/common';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import de from '@angular/common/locales/de';
import { APP_INITIALIZER, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import DOMPurify from 'dompurify';
import { NZ_I18N, de_DE } from 'ng-zorro-antd/i18n';

import { AuthModule, DevAuthModule } from '@kordis/spa/core/auth';
import { GraphqlModule } from '@kordis/spa/core/graphql';
import {
	NoopObservabilityModule,
	SentryObservabilityModule,
} from '@kordis/spa/core/observability';

import { environment } from '../environments/environment';
import { AppComponent } from './component/app.component';
import routes from './routes';

registerLocaleData(de);

@NgModule({
	declarations: [AppComponent],
	bootstrap: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		RouterModule.forRoot(routes),
		environment.oauth
			? AuthModule.forRoot(
					environment.oauth.config,
					environment.oauth.discoveryDocumentUrl,
				)
			: DevAuthModule.forRoot(),
		GraphqlModule.forRoot(
			environment.apiUrl + '/graphql',
			environment.apiUrl + '/graphql-stream',
		),
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
					createScriptURL: (s) => {
						if (
							s === 'ngsw-worker.js' ||
							s.startsWith('blob:' + window.location.origin)
						) {
							return s;
						}
						return '';
					},
				});
			},
			multi: true,
		},
		{ provide: NZ_I18N, useValue: de_DE },
		provideHttpClient(withInterceptorsFromDi()),
	],
})
export class AppModule {}
