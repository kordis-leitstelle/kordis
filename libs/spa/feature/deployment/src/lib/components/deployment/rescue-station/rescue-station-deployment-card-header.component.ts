import { Component, computed, input } from '@angular/core';

import { RescueStationDeployment } from '@kordis/shared/model';

import { NoteIndicatorComponent } from '../note-indicator.component';

@Component({
	selector: 'krd-rescue-station-deployment-card-header',
	imports: [NoteIndicatorComponent],
	template: `
		<span
			>{{ rescueStation().strength.leaders }}/{{
				rescueStation().strength.subLeaders
			}}/{{ rescueStation().strength.helpers }}//{{ totalStrength() }}</span
		>
		@if (rescueStation().note) {
			<krd-note-indicator [note]="rescueStation().note" />
		}
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
	`,
})
export class RescueStationDeploymentCardHeaderComponent {
	readonly rescueStation = input.required<RescueStationDeployment>();
	protected readonly totalStrength = computed(
		() =>
			this.rescueStation().strength.leaders +
			this.rescueStation().strength.subLeaders +
			this.rescueStation().strength.helpers,
	);
}
