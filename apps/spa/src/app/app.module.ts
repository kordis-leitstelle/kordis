import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import de from '@angular/common/locales/de';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
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
	],
	providers: [{ provide: NZ_I18N, useValue: de_DE }],
	bootstrap: [AppComponent],
})
export class AppModule {}
