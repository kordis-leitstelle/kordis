import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AuthModule, DevAuthModule } from '@kordis/spa/auth';
import {
	NoopObservabilityModule,
	SentryObservabilityModule,
} from '@kordis/spa/observability';

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
		environment.sentryKey
			? SentryObservabilityModule.forRoot(
					environment.sentryKey,
					environment.environmentName,
					environment.releaseVersion,
			  )
			: NoopObservabilityModule.forRoot(),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
