import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TraceComponent } from '@kordis/spa/observability';

@Component({
	selector: 'kordis-root',
	template: ` <router-outlet></router-outlet> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
@TraceComponent()
export class AppComponent {}
