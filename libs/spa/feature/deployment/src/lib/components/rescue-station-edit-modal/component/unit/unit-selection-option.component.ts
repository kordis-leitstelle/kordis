import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Unit } from '@kordis/shared/model';

import { StatusBadgeComponent } from '../../../deployment/status-badge.component';

@Component({
	selector: 'krd-unit-selection-option',
	standalone: true,
	imports: [StatusBadgeComponent],
	template: `
		<div class="result-item">
			<div class="info">
				<div>
					<span class="call-sign">{{ unit().callSign }}</span>
					<span class="name">{{ unit().name }}</span>
				</div>
				<krd-status-badge [status]="unit().status?.status" />
			</div>
			<span class="assignment-note">
				@if (
					unit().assignment?.__typename === 'EntityRescueStationAssignment'
				) {
					Zuordnung: {{ unit().assignment!.name }}
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

				.call-sign {
					font-weight: 500;
					margin-right: 5px;
				}

				.name {
					color: grey;
					font-size: 0.9em;
				}
			}

			.assignment-note {
				font-size: 0.8em;
				margin: -5px 0;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitSelectionOptionComponent {
	readonly unit = input.required<Unit>();
}
