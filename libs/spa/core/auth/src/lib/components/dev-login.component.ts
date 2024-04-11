import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AuthUser, Role } from '@kordis/shared/model';
import { TEST_USERS } from '@kordis/shared/test-helpers';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';

@Component({
	selector: 'krd-auth',
	standalone: true,
	styles: [
		`
			.container {
				max-width: 500px;
				padding: 20px;

				> div {
					display: flex;
					gap: 5px;
				}

				> form {
					display: flex;
					margin-top: 1.25rem;
					flex-direction: column;

					> button {
						margin-top: 0.5rem;
					}
				}
			}
		`,
	],
	template: `
		<div class="container">
			<div>
				@for (username of usernames; track i; let i = $index) {
					<button
						nz-button
						(click)="loginAsTestuser(i)"
						[attr.data-username]="username"
					>
						Login as <b> {{ username }}</b>
					</button>
				}
			</div>
			<form [formGroup]="customClaimsForm" (ngSubmit)="loginWithCustomClaims()">
				<label for="id">ID</label>
				<input nz-input id="id" type="text" formControlName="id" />
				<label for="orgId">Organization ID</label>
				<input
					nz-input
					id="orgId"
					type="text"
					formControlName="organizationId"
				/>
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
				<label>Role</label>
				<nz-select formControlName="role">
					<nz-option nzValue="user" nzLabel="User" />
					<nz-option nzValue="admin" nzLabel="Admin" />
					<nz-option nzValue="organization_admin" nzLabel="Org Admin" />
				</nz-select>
				<button nz-button nzSize="large" nzType="primary" type="submit">
					Login as Custom user
				</button>
			</form>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule,
		NzInputDirective,
		NzButtonComponent,
		NzSelectModule,
	],
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
