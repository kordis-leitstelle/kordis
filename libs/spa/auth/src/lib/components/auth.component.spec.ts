import { NgOptimizedImage } from '@angular/common';
import { SpectatorRouting, createRoutingFactory } from '@ngneat/spectator/jest';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzContentComponent, NzLayoutComponent } from 'ng-zorro-antd/layout';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
	let spectator: SpectatorRouting<AuthComponent>;
	const createComponent = createRoutingFactory({
		component: AuthComponent,
		imports: [
			NgOptimizedImage,
			NzContentComponent,
			NzLayoutComponent,
			NzButtonComponent,
		],
		componentProviders: [
			{
				provide: AUTH_SERVICE,
				useClass: DevAuthService,
			},
		],
	});

	beforeEach(() => (spectator = createComponent()));

	it('should show error on query param error', () => {
		spectator.setRouteQueryParam('error', 'some error');

		expect(spectator.query('[data-testid="auth-error-msg"]')).toContainText(
			'Sie konnten nicht authentifiziert werden!',
		);
	});
});
