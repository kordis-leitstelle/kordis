import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OperationStartedMessagePayload } from '@kordis/shared/model';

import { OperationAssignmentsMessageComponent } from './operation-assignments-message.component';
import { ProtocolMessageComponent } from './protocol-message.component';

@Component({
	selector: 'krd-start-operation-message',
	template: `
		<krd-protocol-message prefix="Einsatzbeginn">
			{{ message().operationSign }} - {{ message().alarmKeyword }} -
			@if (message().location.name) {
				{{ message().location.name }}
			}
			@if (message().location.street) {
				{{ message().location.street }}
			}
			-
			<krd-operation-assignments-message
				[assignedAlertGroups]="message().assignedAlertGroups"
				[assignedUnits]="message().assignedUnits"
			/>
		</krd-protocol-message>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [OperationAssignmentsMessageComponent, ProtocolMessageComponent],
})
export class StartOperationMessageComponent {
	readonly message = input.required<OperationStartedMessagePayload>();
}
