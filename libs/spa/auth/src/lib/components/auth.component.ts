import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

import { AUTH_SERVICE, AuthService } from '../services/auth-service';

@Component({
	selector: 'krd-auth',
	styleUrls: [`./auth.component.css`],
	template: `
		<nz-layout>
			<nz-content>
				<div class="login-form">
					<div class="header">
						<h1>Kordis</h1>
						<span> Koordinierungssoftware für Einsatzleitstellen </span>
					</div>
					@if (hasAuthError$ | async) {
						<span data-testid="auth-error-msg">
							Sie konnten nicht authentifiziert werden!
						</span>
					}
					<button
						nz-button
						nzType="primary"
						nzSize="large"
						type="button"
						(click)="login()"
						data-testid="login-btn"
					>
						<span nz-icon nzType="login" nzTheme="outline"></span>
						Anmelden
					</button>
				</div>

				<div class="image">
					<img
						class="cover-image"
						alt="Kordis"
						ngSrc="/assets/login-bg.jpg"
						fill
						priority
					/>
				</div>
			</nz-content>
		</nz-layout>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
	readonly hasAuthError$: Observable<boolean>;

	constructor(
		activatedRoute: ActivatedRoute,
		@Inject(AUTH_SERVICE) private readonly authService: AuthService,
	) {
		this.hasAuthError$ = activatedRoute.queryParams.pipe(
			map((params) => !!params['error']),
			takeUntilDestroyed(),
		);
	}

	login(): void {
		this.authService.login();
	}
}
