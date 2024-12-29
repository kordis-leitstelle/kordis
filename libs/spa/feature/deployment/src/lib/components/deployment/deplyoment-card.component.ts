import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	output,
} from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';

import { DeploymentAssignment } from '@kordis/shared/model';

import { DeploymentAlertGroupComponent } from './alert-group/deployment-alert-group.component';
import { DeploymentUnitComponent } from './unit/deployment-unit.component';

// status - rank mapping
const STATUS_SORT_ORDER: Readonly<Record<number, number>> = Object.freeze({
	3: 1,
	4: 1,
	1: 2,
	2: 3,
	6: 4,
	'-1': 5,
});

@Component({
	selector: 'krd-deployment-card',
	standalone: true,
	imports: [
		DeploymentAlertGroupComponent,
		DeploymentUnitComponent,
		NzCardComponent,
		NzEmptyComponent,
	],
	template: `
		<nz-card [class.clickable]="clickable()" (click)="clicked.emit()">
			<h3>{{ name() }}</h3>

			<div class="sub-header">
				<ng-content select="[role=sub-header]" />
			</div>

			<div class="assignments">
				@for (
					assignment of sortedAssignments();
					track trackDeploymentAssignment($index, assignment)
				) {
					@if (assignment.__typename === 'DeploymentUnit') {
						<krd-deployment-unit [unit]="assignment.unit" />
					} @else if (assignment.__typename === 'DeploymentAlertGroup') {
						<krd-deployment-alert-group
							(click)="$event.stopPropagation()"
							[alertGroup]="assignment.alertGroup"
							[unitAssignments]="assignment.assignedUnits"
						/>
					}
				} @empty {
					<nz-empty
						nzNotFoundImage="simple"
						nzNotFoundContent="Keine Zuordnungen"
					/>
				}
			</div>
		</nz-card>
	`,
	styles: `
		nz-card {
			display: flex;
			flex-direction: column;
			height: 100%;

			h3 {
				margin-bottom: 0;
			}

			.ant-card-body {
				padding: calc(var(--base-spacing) * 2);
				display: flex;
				flex-direction: column;
				flex-grow: 1;
				height: 100%;
			}

			.sub-header {
				margin-bottom: var(--base-spacing);
			}

			.assignments {
				display: flex;
				flex-direction: column;
				gap: calc(var(--base-spacing) / 2);
				width: 100%;
				overflow-y: auto;
				padding-right: calc(var(--base-spacing) / 2);
				box-sizing: content-box;
			}
		}

		.clickable:hover:not(:has(.assignments:hover)) {
			border-color: var(--ant-primary-color);
			cursor: pointer;
		}

		krd-deployment-alert-group {
			cursor: auto;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentCardComponent {
	readonly name = input.required<string>();
	readonly assignments = input.required<DeploymentAssignment[]>();
	readonly clickable = input(true);
	readonly clicked = output<void>();

	readonly sortedAssignments = computed(() => {
		// sort alert group units by status
		const assignmentsWithSortedAlertGroups = structuredClone(
			this.assignments(),
		).map((assignment) => {
			if (assignment.__typename === 'DeploymentAlertGroup') {
				assignment.assignedUnits.sort(
					(a, b) =>
						STATUS_SORT_ORDER[a.unit.status?.status ?? -1] -
						STATUS_SORT_ORDER[b.unit.status?.status ?? -1],
				);
			}
			return assignment;
		});

		// sort by status of a unit or the "highest ranked" status from the units of an alert group
		return assignmentsWithSortedAlertGroups.sort((a, b) => {
			const statusA = this.getEffectiveStatus(a);
			const statusB = this.getEffectiveStatus(b);
			const rankA = STATUS_SORT_ORDER[statusA];
			const rankB = STATUS_SORT_ORDER[statusB];
			return rankA - rankB;
		});
	});

	trackDeploymentAssignment(
		index: number,
		assignment: DeploymentAssignment,
	): string {
		if (assignment.__typename === 'DeploymentUnit') {
			return assignment.unit.id;
		} else if (assignment.__typename === 'DeploymentAlertGroup') {
			return assignment.alertGroup.id;
		}
		return index.toString();
	}

	private getEffectiveStatus(assignment: DeploymentAssignment): number {
		if (assignment.__typename === 'DeploymentUnit') {
			return assignment.unit.status?.status ?? -1;
		} else if (assignment.__typename === 'DeploymentAlertGroup') {
			// we can simply take the first unit because we sorted them above
			return assignment.assignedUnits[0]?.unit.status?.status ?? -1;
		}
		return -1;
	}
}
