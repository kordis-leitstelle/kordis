import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AuthModule, DevAuthModule } from '@kordis/spa/auth';
import { GraphqlModule } from '@kordis/spa/graphql';
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
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
