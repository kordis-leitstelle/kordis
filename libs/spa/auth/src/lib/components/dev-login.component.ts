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
		organization: 'testorganization',
	},
]);

@Component({
	selector: 'krd-auth',
	template: `
		<div style="max-width: 500px; padding: 20px;">
			<div style="display: flex">
				<button nz-button (click)="loginAsTestuser(0)" data-username="testuser">
					Login as&nbsp; <b>testuser</b>
				</button>
			</div>
			<form
				[formGroup]="customClaimsForm"
				(ngSubmit)="loginWithCustomClaims()"
				style="display: flex; margin-top: 1.25rem; flex-direction: column;"
			>
				<label for="id">ID</label>
				<input nz-input id="id" type="text" formControlName="id" />
				<label for="firstName">First name</label>
				<input
					nz-input
					id="firstName"
					type="text"
					formControlName="firstName"
				/>
				<label for="lastName">Last name</label>
				<input nz-input id="lastName" type="text" formControlName="lastName" />
				<label for="email">Email</label>
				<input nz-input id="email" type="text" formControlName="email" />
				<button
					nz-button
					nzSize="large"
					nzType="primary"
					style="margin-top: 0.5rem;"
					type="submit"
				>
					Login as Custom user
				</button>
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
