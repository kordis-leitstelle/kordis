import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';

import { AlertGroup, DeploymentUnit } from '@kordis/shared/model';

import { DeploymentUnitComponent } from '../unit/deployment-unit.component';

@Component({
	selector: 'krd-deployment-alert-group',
	imports: [DeploymentUnitComponent, NzCardComponent],
	template: `
		<nz-card
			[nzBodyStyle]="{
				padding: ' calc(var(--base-spacing) / 2) var(--base-spacing)',
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
			gap: calc(var(--base-spacing) / 2);
		}

		.name {
			font-weight: 500;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentAlertGroupComponent {
	readonly alertGroup = input.required<AlertGroup>();
	readonly unitAssignments = input.required<DeploymentUnit[]>();
}
