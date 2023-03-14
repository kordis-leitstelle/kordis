import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, filter, first } from 'rxjs';

import { AuthService } from '@kordis/spa/auth';

import { environment } from '../environments/environment';

@Component({
	selector: 'kordis-root',
	template: `
		<ng-container *ngIf="authInitCompleted$ | async; else loading">
			<router-outlet></router-outlet>
		</ng-container>
		<ng-template #loading>
			<div
				data-testid="loading-indicator"
				class="flex h-screen items-center justify-center"
			>
				<div
					class="inline-block h-28 w-28 animate-spin rounded-full border-8 border-solid border-current border-r-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"
					role="status"
				>
					<span
						class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
						>Laden...</span
					>
				</div>
			</div>
		</ng-template>
	`,

	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	readonly authInitCompleted$: Observable<boolean> =
		this.authService.isDoneLoading$.pipe(
			filter((isDone: boolean) => isDone),
			delay(300), // looks a bit cleaner
			first(),
		);

	constructor(
		private readonly authService: AuthService,
		private readonly router: Router,
	) {
		authService.init(
			environment.oauth.config,
			environment.oauth.discoveryDocumentUrl,
		);
	}
}
