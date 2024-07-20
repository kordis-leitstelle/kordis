import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	input,
	viewChildren,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
} from '@angular/forms';
import { NzCardComponent } from 'ng-zorro-antd/card';

import { AlertGroup, Unit } from '@kordis/shared/model';

import { PossibleAlertGroupSelectionsService } from '../../service/alert-group-selection.service';
import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import { AlertGroupAutocompleteComponent } from './alert-group-autocomplete.component';
import { AlertGroupSelectionComponent } from './alert-group-selection.component';

@Component({
	selector: 'krd-alert-group-selections',
	standalone: true,
	imports: [
		AlertGroupAutocompleteComponent,
		AlertGroupSelectionComponent,
		NzCardComponent,
	],
	template: `
		<krd-alert-group-autocomplete
			[showErrorState]="formArray().invalid && formArray().touched"
			(alertGroupSelected)="addAlertGroup($event)"
		/>
		@if (formArray().length) {
			<nz-card>
				<div class="selections">
					@for (
						alertGroupAssignment of formArray().controls;
						track alertGroupAssignment.value.alertGroup!.id
					) {
						<krd-alert-group-selection
							[formGroup]="alertGroupAssignment"
							(removed)="removeAlertGroup($index)"
						/>
					}
				</div>
			</nz-card>
		}
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: column;
		}

		.selections:empty {
			margin-top: 0;
		}

		.selections {
			max-height: 115px;
			overflow: auto;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		nz-card {
			.ant-card-body {
				padding: 5px;
			}

			margin-top: 5px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertGroupSelectionsComponent {
	readonly formArray = input.required<
		FormArray<
			FormGroup<{
				alertGroup: FormControl<AlertGroup>;
				assignedUnits: FormControl<Unit[]>;
			}>
		>
	>();
	readonly alertGroupSelectionElements = viewChildren(
		AlertGroupSelectionComponent,
	);
	private readonly possibleAlertGroupSelectionsService = inject(
		PossibleAlertGroupSelectionsService,
	);
	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
		{
			optional: true,
		},
	);
	private readonly fb = inject(NonNullableFormBuilder);
	private readonly cd = inject(ChangeDetectorRef);

	removeAlertGroup(index: number): void {
		const formValue = this.formArray().at(index).value;

		// unmark assigned units of the alert group and the alert group itself
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		for (const unit of formValue.assignedUnits!) {
			this.possibleUnitSelectionsService?.unmarkAsSelected(unit);
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.possibleAlertGroupSelectionsService.unmarkAsSelected(
			formValue.alertGroup!,
		);
		this.formArray().removeAt(index);
	}

	addAlertGroup(alertGroup: AlertGroup): void {
		this.possibleAlertGroupSelectionsService.markAsSelected(alertGroup);
		// newly assigned alert groups should have default units initially
		const alertGroupAssignment = this.fb.group({
			alertGroup: this.fb.control(alertGroup),
			assignedUnits: this.fb.control(
				alertGroup.units.filter(
					(unit) =>
						!(this.possibleUnitSelectionsService?.isSelected(unit) ?? false),
				),
			),
		});

		this.formArray().push(alertGroupAssignment);

		this.cd.detectChanges(); // detect changes, so alertGroupSelectionElements() will be updated

		this.alertGroupSelectionElements()[
			this.alertGroupSelectionElements().length - 1
		].focusUnitSelection();
	}
}
