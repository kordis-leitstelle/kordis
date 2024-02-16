import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
	captureUserFeedback as sentryCaptureFeedback,
	captureMessage as sentryCaptureMessage,
	setUser as sentrySetUser,
} from '@sentry/angular-ivy';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom } from 'rxjs';

import { AUTH_SERVICE, AuthService } from '@kordis/spa/auth';

import { ReportErrorModalComponent } from '../components/report-error-modal.component';

export interface ObservabilityService {
	openErrorModal(): void;

	setUser(id?: string, email?: string, name?: string): void;
}

export const OBSERVABILITY_SERVICE = new InjectionToken<ObservabilityService>(
	'OBSERVABILITY_SERVICE',
);

@Injectable()
export class SentryObservabilityService implements ObservabilityService {
	constructor(
		@Inject(AUTH_SERVICE) private readonly authService: AuthService,
		private readonly modal: NzModalService,
	) {
		this.subscribeToUserChanges();
	}

	setUser(id?: string, email?: string, username?: string): void {
		if (!id) {
			sentrySetUser(null);
		} else {
			sentrySetUser({
				id,
				email,
				username,
			});
		}
	}

	openErrorModal(): void {
		const modal: NzModalRef = this.modal.create({
			nzTitle: 'Kordis - Fehlermeldung',
			nzContent: ReportErrorModalComponent,
			nzOnOk: ({ message }) => this.sendUserFeedback(message),
			nzFooter: [
				{
					label: 'Absenden',
					shape: 'round',
					onClick: () => modal.triggerOk(),
				},
				{
					label: 'Abbrechen',
					shape: 'round',
					onClick: () => modal.destroy(),
				},
			],
		});
	}

	private async sendUserFeedback(message: string): Promise<void> {
		const user = (await firstValueFrom(this.authService.user$))!;
		const eventId = sentryCaptureMessage('User Feedback');

		sentryCaptureFeedback({
			name: user.firstName + ' ' + user.lastName,
			email: user.email,
			comments: message,
			event_id: eventId,
		});
	}

	private subscribeToUserChanges(): void {
		this.authService.user$.subscribe((user) => {
			this.setUser(
				user?.id,
				user?.email,
				`${user?.firstName} ${user?.lastName}`,
			);
		});
	}
}

@Injectable()
export class NoopObservabilityService implements ObservabilityService {
	setUser(): void {
		// noop
	}

	openErrorModal(): void {
		// noop
	}
}
