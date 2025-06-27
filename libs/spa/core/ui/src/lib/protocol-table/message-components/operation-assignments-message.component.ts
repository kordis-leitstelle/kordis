import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '@kordis/shared/model';

@Component({
	selector: 'krd-operation-assignments-message',
	template: `
		@for (
			alertGroup of assignedAlertGroups();
			track alertGroup.alertGroupId;
			let last = $last
		) {
			<i>{{ alertGroup.alertGroupName }}</i> (
			@for (
				unit of alertGroup.assignedUnits;
				track unit.unitId;
				let last = $last
			) {
				{{ unit.unitSign }}
				@if (!last && alertGroup.assignedUnits.length > 1) {
					,
				}
			}
			)
			@if (
				(last && assignedUnits().length > 0) ||
				(!last && assignedAlertGroups().length > 1)
			) {
				,
			}
		}

		@for (unit of assignedUnits(); track unit.unitId; let last = $last) {
			{{ unit.unitSign }}
			@if (!last && assignedUnits().length > 1) {
				,
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationAssignmentsMessageComponent {
	readonly assignedAlertGroups =
		input.required<OperationMessageAssignedAlertGroup[]>();
	readonly assignedUnits = input.required<OperationMessageAssignedUnit[]>();
}
