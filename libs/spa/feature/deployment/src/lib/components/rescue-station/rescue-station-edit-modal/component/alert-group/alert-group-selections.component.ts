import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
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
import {
	NzFormControlComponent,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';

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
		NzFormControlComponent,
		NzFormItemComponent,
	],
	template: `
		<nz-form-item>
			<nz-form-control [nzValidateStatus]="formArray()">
				<krd-alert-group-autocomplete
					(alertGroupSelected)="addAlertGroup($event)"
				/>
			</nz-form-control>
		</nz-form-item>
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

		nz-form-item {
			margin-bottom: 0;
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

	constructor() {
		effect(() => {
			// initially mark alert groups as selected
			this.formArray()
				.getRawValue()
				.forEach((value) =>
					this.possibleAlertGroupSelectionsService.markAsSelected(
						value.alertGroup,
					),
				);
		});
	}

	removeAlertGroup(index: number): void {
		const formValue = this.formArray().at(index).getRawValue();

		// unmark assigned units of the alert group and the alert group itself
		for (const unit of formValue.assignedUnits) {
			this.possibleUnitSelectionsService?.unmarkAsSelected(unit);
		}
		this.possibleAlertGroupSelectionsService.unmarkAsSelected(
			formValue.alertGroup,
		);

		this.formArray().removeAt(index);
	}

	addAlertGroup(alertGroup: AlertGroup): void {
		this.possibleAlertGroupSelectionsService.markAsSelected(alertGroup);
		// newly assigned alert groups should have current units initially
		const alertGroupAssignment = this.fb.group({
			alertGroup: this.fb.control(alertGroup),
			assignedUnits: this.fb.control(
				alertGroup.currentUnits.filter(
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
