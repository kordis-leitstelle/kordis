import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UnitUnion } from '@kordis/shared/model';

@Component({
	selector: 'krd-unit-chip',
	standalone: true,
	imports: [CommonModule, NzTagModule, NzToolTipModule],
	template: `
		<ng-container *ngIf="unit() as unit">
			<nz-tag>
				<!-- TODO: Set Icon -->
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
			<ng-container> </ng-container
		></ng-container>
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitChipComponent {
	public unit = input.required<UnitUnion>();
}