import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { combineLatest, map, startWith } from 'rxjs';

import { Unit } from '@kordis/shared/model';
import { AlertGroupAssignmentFormGroup } from '@kordis/spa/core/misc';

@Component({
	selector: 'krd-already-involved-units-alert',
	template: `
		@let alreadyAssignedUnits = (alreadyOperationAssignedUnits() | async) ?? [];
		@if (alreadyAssignedUnits.length > 0) {
			<ng-template #alreadyAssignedUnitsTmpl>
				Folgende Einheiten sind bereits einem Einsatz zugeordnet und werden
				rausgelöst:<br />
				<ul>
					@for (unit of alreadyAssignedUnits; track unit.id) {
						<li>
							{{ unit.callSign }} <small>{{ unit.name }}</small> -
							{{ $any(unit.assignment).operation.alarmKeyword }}
							{{ $any(unit.assignment).operation.sign }}
						</li>
					}
				</ul>
			</ng-template>

			<nz-alert nzType="warning" [nzMessage]="alreadyAssignedUnitsTmpl" />
		}
	`,
	imports: [NzAlertComponent, AsyncPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlreadyInvolvedUnitsAlertComponent {
	readonly unitsControl = input.required<FormControl<Unit[]>>();
	readonly alertGroupsControl =
		input.required<FormArray<AlertGroupAssignmentFormGroup>>();

	readonly alreadyOperationAssignedUnits = computed(() =>
		combineLatest([
			this.unitsControl().valueChanges.pipe(
				map((units) =>
					units.filter(
						(unit) =>
							unit.assignment?.__typename === 'EntityOperationAssignment',
					),
				),
				startWith([]),
			),
			this.alertGroupsControl().valueChanges.pipe(
				map((alertGroups) =>
					alertGroups
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						.flatMap((group) => group.assignedUnits!)
						.filter(
							(unit) =>
								unit.assignment?.__typename === 'EntityOperationAssignment',
						),
				),
				startWith([]),
			),
		]).pipe(map(([units, alertGroupUnits]) => [...units, ...alertGroupUnits])),
	);
}
