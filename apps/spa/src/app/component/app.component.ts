import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NEVER, switchMap } from 'rxjs';

import { AUTH_SERVICE } from '@kordis/spa/core/auth';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import { TraceComponent } from '@kordis/spa/core/observability';

@Component({
	selector: 'kordis-root',
	template: ` <router-outlet></router-outlet> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
@TraceComponent()
export class AppComponent {
	private readonly authService = inject(AUTH_SERVICE);
	private readonly gqlService = inject(GraphqlService);

	constructor() {
		this.logoutOnUserDeactivated();
	}

	logoutOnUserDeactivated(): void {
		this.authService.isAuthenticated$
			.pipe(
				switchMap((isAuthenticated) => {
					if (!isAuthenticated) {
						return NEVER;
					}
					return this.gqlService.subscribe$(gql`
						subscription {
							currentUserDeactivated {
								userId
							}
						}
					`);
				}),
				takeUntilDestroyed(),
			)
			.subscribe(() => this.authService.logout());
	}
}
