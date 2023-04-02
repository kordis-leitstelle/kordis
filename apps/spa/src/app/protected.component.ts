import { ChangeDetectionStrategy, Component } from '@angular/core';

// placeholder until we have a feature structure
@Component({
	selector: 'kordis-root',
	template: ` ganz geheim `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtectedComponent {}
