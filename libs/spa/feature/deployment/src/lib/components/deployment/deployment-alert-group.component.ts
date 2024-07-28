import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';

import { AlertGroup, DeploymentUnit } from '@kordis/shared/model';

import { DeploymentUnitComponent } from './deployment-unit.component';

@Component({
	selector: 'krd-deployment-alert-group',
	standalone: true,
	imports: [CommonModule, NzCardComponent, DeploymentUnitComponent],
	template: `
		<nz-card
			[nzBodyStyle]="{
				padding: '5px 10px',
				'background-color': '#fafafa',
			}"
		>
			<div class="alert-group">
				<span class="name">{{ alertGroup().name }}</span>
				@for (
					unitAssignment of unitAssignments();
					track unitAssignment.unit.id
				) {
					<krd-deployment-unit [unit]="unitAssignment.unit" />
				} @empty {
					<span data-testid="no-unit-assignments">Keine Zuordnungen</span>
				}
			</div>
		</nz-card>
	`,
	styles: `
		.alert-group {
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		.name {
			font-weight: 500;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentAlertGroupComponent {
	alertGroup = input.required<AlertGroup>();
	unitAssignments = input.required<DeploymentUnit[]>();
}
