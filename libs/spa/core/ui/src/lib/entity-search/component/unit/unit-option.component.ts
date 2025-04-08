import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Unit } from '@kordis/shared/model';

@Component({
	selector: 'krd-unit-option',
	template: `
		<span class="call-sign">{{ unit().callSign }}</span>
		<span class="name">{{ unit().name }}</span>
	`,
	styles: `
		.call-sign {
			font-weight: 500;
			margin-right: calc(var(--base-spacing) / 2);
		}

		.name {
			color: grey;
			font-size: 0.9em;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitOptionComponent {
	readonly unit = input.required<Unit>();
}
