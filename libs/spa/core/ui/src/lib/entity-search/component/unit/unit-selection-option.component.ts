import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Unit } from '@kordis/shared/model';

import { StatusBadgeComponent } from '../../../status-badge.component';
import { UnitOptionComponent } from './unit-option.component';

@Component({
	selector: 'krd-unit-selection-option',
	imports: [StatusBadgeComponent, UnitOptionComponent],
	template: `
		<div class="result-item">
			<div class="info">
				<div>
					<krd-unit-option [unit]="unit()" />
				</div>
				<krd-status-badge [status]="unit().status?.status" />
			</div>
			<span class="assignment-note">
				@if (
					unit().assignment?.__typename === 'EntityRescueStationAssignment'
				) {
					Zuordnung: {{ $any(unit().assignment).name }}
				} @else if (
					unit().assignment?.__typename === 'EntityOperationAssignment'
				) {
					Zuordnung: {{ $any(unit().assignment).operation.alarmKeyword }}
					{{ $any(unit().assignment).operation.sign }}
				} @else {
					Keine Zuordnung
				}
			</span>
		</div>
	`,
	styles: `
		.result-item {
			display: flex;
			flex-direction: column;

			.info {
				display: flex;
				justify-content: space-between;
			}

			.assignment-note {
				font-size: 0.8em;
				margin: calc(-1 * var(--base-spacing) / 2) 0;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitSelectionOptionComponent {
	readonly unit = input.required<Unit>();
}
