import { Component, input } from '@angular/core';
import { RescueStationMessagePayload } from '@kordis/shared/model';

@Component({
	selector: 'krd-rescue-station-message',
	template: `
		@if(type() === "SIGN_ON") {
			Anmeldung
		} @else {
			Nachmeldung
		}: {{ message().rescueStationName }}; Stärke:
		{{ message().strength.leaders }}/{{
			message().strength.subLeaders
		}}/{{ message().strength.helpers }}/{{
			message().strength.leaders +
			message().strength.subLeaders +
			message().strength.helpers
		}}
		@if (message().units.length > 0) {
			; Einheiten:
			@for (unit of message().units;
				track unit.id;
				let last = $last) {
				{{ unit.callSign }}
				@if (!last) {
					,
				}
			}
		}
		@if (message().alertGroups.length > 0) {
			; Alarmgruppen:
			@for (alertGroup of message().alertGroups;
				track alertGroup.id;
				let last = $last) {
				{{ alertGroup.name }} (
				@for (unit of alertGroup.units;
					track unit.id;
					let last = $last) {
					{{ unit.callSign }}
					@if (!last) {
						,
					}
				}
				)
				@if (!last) {
					,
				}
			}
		}
	`,
})
export class RescueStationMessageComponent {
	message = input.required<RescueStationMessagePayload>();
	type = input.required<'SIGN_ON' | 'UPDATE'>();
}
