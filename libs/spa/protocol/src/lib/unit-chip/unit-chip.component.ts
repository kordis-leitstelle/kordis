import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { Unit } from '../protocol/protocol.model';

@Component({
	selector: 'krd-unit-chip',
	standalone: true,
	imports: [CommonModule, NzTagModule],
	template: `
		<nz-tag>
			<!-- TODO: Set Icon -->
			<span nz-icon></span>
			<span>{{ unit.name }}</span>
		</nz-tag>
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitChipComponent {
	@Input({ required: true }) unit!: Unit;
}
