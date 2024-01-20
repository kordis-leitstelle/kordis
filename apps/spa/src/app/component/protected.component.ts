import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TraceComponent } from '@kordis/spa/observability';

// placeholder until we have a feature structure
@Component({
	selector: 'kordis-protected',
	template: ` ganz geheim `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
@TraceComponent()
export class ProtectedComponent {}
