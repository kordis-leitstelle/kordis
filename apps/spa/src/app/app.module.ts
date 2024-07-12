import { registerLocaleData } from '@angular/common';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import de from '@angular/common/locales/de';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
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
		{ provide: NZ_I18N, useValue: de_DE },
		provideHttpClient(withInterceptorsFromDi()),
	],
})
export class AppModule {}
