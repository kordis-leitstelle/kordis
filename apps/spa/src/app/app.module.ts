import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AuthModule, DevAuthModule } from '@kordis/spa/auth';
import { ObservabilityModule } from '@kordis/spa/observability';

import { environment } from '../environments/environment';
import { AppComponent } from './component/app.component';
import { ProtectedComponent } from './component/protected.component';
import routes from './routes';

@NgModule({
	declarations: [AppComponent, ProtectedComponent],
	imports: [
		BrowserModule,
		HttpClientModule,
		RouterModule.forRoot(routes),
		environment.oauth
			? AuthModule.forRoot(
					environment.oauth.config,
					environment.oauth.discoveryDocumentUrl,
				)
			: DevAuthModule.forRoot(),
		// for now, we accept that we have the sentry module and dependencies in our dev bundle as well
		ObservabilityModule.forRoot(
			environment.sentryKey
				? {
						dsn: environment.sentryKey,
						environment: environment.environmentName,
						release: environment.releaseVersion,
					}
				: undefined,
			environment.instatusUrl
				? {
						url: environment.instatusUrl,
						checkIntervalMs: 30000,
					}
				: undefined,
		),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
