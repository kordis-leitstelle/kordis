import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RescueStationMessagePayload } from '@kordis/shared/model';

import { ProtocolMessageComponent } from './protocol-message.component';

@Component({
	selector: 'krd-rescue-station-message',
	template: `
		<krd-protocol-message
			[prefix]="type() === 'SIGN_ON' ? 'Anmeldung' : 'Nachmeldung'"
		>
			{{ message().rescueStationName }} - {{ message().strength.leaders }}/{{
				message().strength.subLeaders
			}}/{{ message().strength.helpers }}/{{
				message().strength.leaders +
					message().strength.subLeaders +
					message().strength.helpers
			}}
			-
			@for (
				alertGroup of message().alertGroups;
				track alertGroup.id;
				let last = $last
			) {
				<i>{{ alertGroup.name }}</i> (
				@for (unit of alertGroup.units; track unit.id; let last = $last) {
					{{ unit.callSign }}
					@if (!last && alertGroup.units.length > 1) {
						,
					}
				}
				)
				@if (
					(last && message().units.length > 0) ||
					(!last && message().alertGroups.length > 1)
				) {
					,
				}
			}

			@for (unit of message().units; track unit.id; let last = $last) {
				{{ unit.callSign }}
				@if (!last && message().units.length > 1) {
					,
				}
			}
		</krd-protocol-message>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ProtocolMessageComponent],
})
export class RescueStationMessageComponent {
	message = input.required<RescueStationMessagePayload>();
	type = input.required<'SIGN_ON' | 'UPDATE'>();
}
