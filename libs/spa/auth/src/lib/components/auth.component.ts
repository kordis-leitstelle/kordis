import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Component({
	selector: 'krd-auth',
	template: `
		<div class="flex h-screen">
			<div
				class="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
			>
				<div class="mx-auto w-full lg:w-[400px]">
					<div class="mb-8 ">
						<h1 class="text-4xl text-blue-500">Kordis</h1>
						<span class="text-lg text-gray-800">
							Koordinierungssoftware für Einsatzleitstellen
						</span>
					</div>
					<span
						data-testid="auth-error-msg"
						class="text-red-500"
						*ngIf="hasAuthError$ | async"
					>
						Sie konnten nicht authentifiziert werden!
					</span>
					<button
						(click)="login()"
						type="button"
						class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="-ml-0.5 h-5 w-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
							/>
						</svg>

						Anmelden
					</button>
				</div>
			</div>
			<div class="relative hidden w-0 flex-1 lg:block">
				<img
					class="absolute inset-0 h-full w-full object-cover"
					alt="Kordis"
					src="/assets/login-bg.jpg"
				/>
			</div>
		</div>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
	readonly hasAuthError$: Observable<boolean>;

	constructor(
		private readonly activatedRoute: ActivatedRoute,
		private readonly authService: AuthService,
	) {
		this.hasAuthError$ = this.activatedRoute.queryParams.pipe(
			map((params) => !!params['error']),
		);
	}

	login(): void {
		this.authService.login();
	}
}
