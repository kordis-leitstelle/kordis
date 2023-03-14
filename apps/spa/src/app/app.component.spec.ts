import {
	Spectator,
	createComponentFactory,
	mockProvider,
} from '@ngneat/spectator/jest';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { of } from 'rxjs';

import { AuthService } from '@kordis/spa/auth';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
	let spectator: Spectator<AppComponent>;
	const createComponent = createComponentFactory({
		component: AppComponent,
		providers: [mockProvider(OAuthService)],
		componentProviders: [
			mockProvider(AuthService, {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				init(config: AuthConfig, discoveryDocumentUrl: string) {
					return;
				},
				isDoneLoading$: of(false),
				isAuthenticated$: of(false),
			}),
		],
	});

	beforeEach(() => (spectator = createComponent()));

	it('should show loading indicator during auth init', async () => {
		expect(spectator.query("[data-testid='loading-indicator']")).toBeTruthy();
	});
});
