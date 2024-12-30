import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AuthUser, Role } from '@kordis/shared/model';
import { TEST_USERS } from '@kordis/shared/test-helpers';

import { AUTH_SERVICE } from '../services/auth-service';
import { DevAuthService } from '../services/dev-auth.service';

@Component({
	selector: 'krd-auth',
	styles: [
		`
			.container {
				max-width: 500px;
				margin: 0 auto;
				height: 100%;
				padding: calc(2 * var(--base-spacing));
				display: flex;
				justify-content: center;
				flex-direction: column;
				gap: var(--base-spacing);

				> form {
					display: flex;
					flex-direction: column;

					button {
						margin-top: var(--base-spacing);
						width: 100%;
					}
				}
			}
		`,
	],
	template: `
		<div class="container">
			@for (username of usernames; track i; let i = $index) {
				<button
					nz-button
					(click)="loginAsTestuser(i)"
					[attr.data-username]="username"
				>
					Login as <b> {{ username }}</b>
				</button>
			}
			<nz-divider />
			<form
				[formGroup]="customClaimsForm"
				(ngSubmit)="loginWithCustomClaims()"
				nzForm
			>
				<nz-form-item>
					<nz-form-control>
						<input
							nz-input
							name="id"
							type="text"
							formControlName="id"
							placeholder="ID"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<input
							nz-input
							name="organizationId"
							type="text"
							formControlName="organizationId"
							placeholder="Organization ID"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<input
							nz-input
							name="firstName"
							type="text"
							formControlName="firstName"
							placeholder="First name"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<input
							nz-input
							name="lastName"
							type="text"
							formControlName="lastName"
							placeholder="Last name"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<input
							nz-input
							name="email"
							type="text"
							formControlName="email"
							placeholder="Email"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<nz-select formControlName="role">
							<nz-option nzValue="user" nzLabel="User" />
							<nz-option nzValue="admin" nzLabel="Admin" />
							<nz-option nzValue="organization_admin" nzLabel="Org Admin" />
						</nz-select>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<button nz-button nzType="primary" type="submit">
							Login as Custom user
						</button>
					</nz-form-control>
				</nz-form-item>
			</form>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule,
		NzButtonComponent,
		NzSelectModule,
		NzDividerModule,
		NzFormModule,
		NzInputModule,
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
