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
import { GeocodingModule } from '@kordis/spa/core/geocoding';
import { provideGraphQL } from '@kordis/spa/core/graphql';
import { SHARED_TOKENS } from '@kordis/spa/core/misc';
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
		environment.sentryKey
			? SentryObservabilityModule.forRoot(
					environment.sentryKey,
					environment.environmentName,
					environment.releaseVersion,
				)
			: NoopObservabilityModule.forRoot(),
		environment.maptilerKey
			? GeocodingModule.forRoot(environment.maptilerKey)
			: [],
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: !isDevMode(),
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
	providers: [
		{ provide: NZ_I18N, useValue: de_DE },
		{ provide: SHARED_TOKENS.API_URL, useValue: environment.apiUrl },
		provideHttpClient(withInterceptorsFromDi()),
		provideGraphQL(
			environment.apiUrl + '/graphql',
			environment.apiUrl + '/graphql-stream',
		),
	],
})
export class AppModule {}
