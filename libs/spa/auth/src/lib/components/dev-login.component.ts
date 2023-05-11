import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthUser } from '@kordis/shared/auth';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';

const TEST_USERS: Readonly<AuthUser[]> = Object.freeze([
	{
		firstName: 'Test',
		lastName: 'User',
		email: 'testuser@test.com',
		id: 'testuser@kordis-leitstelle.de',
	},
]);

@Component({
	selector: 'krd-auth',
	styles: [
		`
			button {
				@apply rounded bg-blue-500 px-4 py-2 text-white;
			}

			input {
				@apply rounded-md border p-1.5;
			}
		`,
	],
	template: `
		<div style="max-width: 500px; padding: 20px;">
			<div class="flex">
				<button (click)="loginAsTestuser(0)" data-username="testuser">
					Login as <b>testuser</b>
				</button>
			</div>
			<form
				[formGroup]="customClaimsForm"
				(ngSubmit)="loginWithCustomClaims()"
				class="mt-5 flex flex-col"
			>
				<label for="id">ID</label>
				<input id="id" type="text" formControlName="id" />
				<label for="firstName">First name</label>
				<input id="firstName" type="text" formControlName="firstName" />
				<label for="lastName">Last name</label>
				<input id="lastName" type="text" formControlName="lastName" />
				<label for="email">Email</label>
				<input id="email" type="text" formControlName="email" />
				<button class="mt-2" type="submit">Login as Custom user</button>
			</form>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevLoginComponent {
	customClaimsForm = this.fb.group({
		id: ['', Validators.required],
		firstName: ['', Validators.required],
		lastName: ['', Validators.required],
		email: ['', Validators.required],
	});

	constructor(
		@Inject(AUTH_SERVICE) private readonly devAuthService: DevAuthService,
		private readonly fb: FormBuilder,
		private readonly router: Router,
	) {}

	loginAsTestuser(id: number): void {
		this.devAuthService.setSession(TEST_USERS[id]);
		void this.router.navigate(['/']);
	}

	loginWithCustomClaims(): void {
		if (!this.customClaimsForm.valid) {
			window.alert('Please fill out all claim fields');
			return;
		}

		this.devAuthService.setSession(this.customClaimsForm.value as AuthUser);
		void this.router.navigate(['/']);
	}
}
