import { Component, computed, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { RescueStationDeployment } from '@kordis/shared/model';

import { DeploymentCardComponent } from '../deplyoment-card.component';

@Component({
	selector: 'krd-rescue-station-deployment-card-header',
	standalone: true,
	imports: [DeploymentCardComponent, NzTooltipDirective, NzIconDirective],
	template: `
		<span
			>{{ rescueStation().strength.leaders }}/{{
				rescueStation().strength.subLeaders
			}}/{{ rescueStation().strength.helpers }}//{{ totalStrength() }}</span
		>
		@if (rescueStation().note) {
			<i nz-icon nzType="info-circle" [nz-tooltip]="rescueStation().note"> </i>
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
