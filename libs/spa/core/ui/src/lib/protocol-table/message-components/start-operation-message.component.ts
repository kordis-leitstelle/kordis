import { Component, input } from '@angular/core';

import { OperationStartedMessagePayload } from '@kordis/shared/model';

@Component({
	selector: 'krd-start-operation-message',
	template: `
		<b>Einsatz {{ message().operationSign }}</b>
		{{ message().alarmKeyword }}
		@if (message().location.name) {
			{{ message().location.name }}
		}
		@if (message().location.street) {
			{{ message().location.street }}
		}
		- Einheiten:
		@for (
			alertGroup of message().assignedAlertGroups;
			track alertGroup.alertGroupId;
			let last = $last
		) {
			{{ alertGroup.alertGroupName }}
			(
			@for (unit of alertGroup.assignedUnits; track unit.unitId) {
				{{ unit.unitSign }}
			}
			)
			@if (
				(last && message().assignedUnits.length > 0) ||
				(!last && message().assignedAlertGroups.length > 1)
			) {
				,
			}
		}
		@for (
			unit of message().assignedUnits;
			track unit.unitId;
			let last = $last
		) {
			{{ unit.unitSign }}
			@if (!last && message().assignedUnits.length > 1) {
				,
			}
		}
	`,
})
export class StartOperationMessageComponent {
	message = input.required<OperationStartedMessagePayload>();
}
