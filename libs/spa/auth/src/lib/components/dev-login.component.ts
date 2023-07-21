import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthUser, Role } from '@kordis/shared/auth';
import { TEST_USERS } from '@kordis/shared/test-helpers';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';

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

			select {
				@apply rounded-md border py-1.5 pl-3;
			}
		`,
	],
	template: `
		<div style="padding: 20px;">
			<div class="flex gap-2">
				<button
					*ngFor="let username of usernames; let i = index"
					(click)="loginAsTestuser(i)"
					[attr.data-username]="username"
				>
					Login as <b>{{ username }}</b>
				</button>
			</div>
			<form
				[formGroup]="customClaimsForm"
				(ngSubmit)="loginWithCustomClaims()"
				class="mt-5 flex max-w-xl flex-col"
			>
				<label for="id">ID</label>
				<input id="id" type="text" formControlName="id" />
				<label for="firstName">First name</label>
				<input id="firstName" type="text" formControlName="firstName" />
				<label for="lastName">Last name</label>
				<input id="lastName" type="text" formControlName="lastName" />
				<label for="email">Email</label>
				<input id="email" type="text" formControlName="email" />
				<label for="role">Role</label>
				<select name="role" formControlName="role">
					<option value="user">User</option>
					<option value="admin">Admin</option>
					<option value="organization_admin">Org Admin</option>
				</select>
				<button class="mt-2" type="submit">Login as Custom user</button>
			</form>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevLoginComponent {
	readonly customClaimsForm = this.fb.nonNullable.group({
		id: ['', Validators.required],
		firstName: ['', Validators.required],
		lastName: ['', Validators.required],
		email: ['', Validators.required],
		organizationId: ['', Validators.required],
		role: [Role.USER, Validators.required],
	});

	readonly usernames = TEST_USERS.map((u) => u.userName);

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
