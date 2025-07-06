import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UnitUnion } from '@kordis/shared/model';

@Component({
	selector: 'krd-unit-chip',
	imports: [NzTagModule, NzToolTipModule],
	template: `
		@if (unit(); as unit) {
			<nz-tag>
				<span nz-icon></span>
				@switch (unit.__typename) {
					@case ('UnknownUnit') {
						<span>{{ unit.name }}</span>
					}
					@case ('RegisteredUnit') {
						<span nz-tooltip [nzTooltipTitle]="unit.unit.name">{{
							unit.unit.callSign
						}}</span>
					}
				}
			</nz-tag>
		}
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitChipComponent {
	public unit = input.required<UnitUnion>();
}
