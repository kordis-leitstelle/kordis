import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
	selector: 'kordis-root',
	standalone: true,
	imports: [NxWelcomeComponent],
	template: `<kordis-nx-welcome></kordis-nx-welcome>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	title = 'client';
}
