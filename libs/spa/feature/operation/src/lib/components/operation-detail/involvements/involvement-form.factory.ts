import { Injectable, inject } from '@angular/core';
import { FormArray, FormGroup, NonNullableFormBuilder } from '@angular/forms';

import {
	AlertGroup,
	Operation,
	OperationUnitInvolvement,
} from '@kordis/shared/model';

import { dateInPastValidator } from '../../../validator/date-in-past.validator';
import { AlertGroupInvolvementFormGroup } from './form/alert-group/operation-alert-group-involvements-form.component';
import { UnitInvolvementFormGroup } from './form/unit/operation-unit-involvement-times.component';
import {
	involvementTimeRangeValidator,
	involvementsTimeIntersectingValidator,
} from './involvements.validator';

export type InvolvementFormGroup = FormGroup<{
	unitInvolvements: FormArray<UnitInvolvementFormGroup>;
	alertGroupInvolvements: FormArray<AlertGroupInvolvementFormGroup>;
}>;

@Injectable({
	providedIn: 'root',
})
export class InvolvementFormFactory {
	private readonly fb = inject(NonNullableFormBuilder);

	createForm(): InvolvementFormGroup {
		return this.fb.group({
			unitInvolvements: this.fb.array<UnitInvolvementFormGroup>([]),
			alertGroupInvolvements: this.fb.array<AlertGroupInvolvementFormGroup>([]),
		});
	}

	createAlertGroupInvolvementsFormArray(
		operation: Operation,
	): FormArray<AlertGroupInvolvementFormGroup> {
		return this.fb.array<AlertGroupInvolvementFormGroup>(
			operation.alertGroupInvolvements.map((alertGroupInvolvement) =>
				this.createAlertGroupInvolvementFormGroup(
					alertGroupInvolvement.alertGroup,
					alertGroupInvolvement.unitInvolvements,
					new Date(operation.start),
					operation.end ? new Date(operation.end) : null,
				),
			),
		);
	}

	createAlertGroupInvolvementFormGroup(
		alertGroup: AlertGroup,
		unitInvolvements: OperationUnitInvolvement[],
		minStart: Date,
		maxEnd: Date | null,
	): AlertGroupInvolvementFormGroup {
		return this.fb.group({
			alertGroup: this.fb.control(alertGroup),
			unitInvolvements: this.createUnitInvolvementsFormArray(
				unitInvolvements,
				minStart,
				maxEnd,
			),
		});
	}

	createUnitInvolvementsFormArray(
		unitInvolvements: OperationUnitInvolvement[],
		minStart: Date,
		maxEnd: Date | null,
	): FormArray<UnitInvolvementFormGroup> {
		return this.fb.array<UnitInvolvementFormGroup>(
			unitInvolvements.map((unitInvolvement) =>
				this.createUnitInvolvementFormGroup(unitInvolvement, minStart, maxEnd),
			),
		);
	}

	createUnitInvolvementFormGroup(
		unitInvolvement: OperationUnitInvolvement,
		minStart: Date,
		maxEnd: Date | null,
	): UnitInvolvementFormGroup {
		return this.fb.group({
			unit: this.fb.control(unitInvolvement.unit),
			isPending: this.fb.control(unitInvolvement.isPending),
			involvementTimes: this.fb.array(
				unitInvolvement.involvementTimes.map((time) =>
					this.fb.group(
						{
							start: this.fb.control<Date | null>(new Date(time.start)),
							end: this.fb.control(
								time.end ? new Date(time.end) : null,
								dateInPastValidator,
							),
						},
						{
							validators: [involvementTimeRangeValidator(minStart, maxEnd)],
						},
					),
				),
				{
					validators: involvementsTimeIntersectingValidator,
				},
			),
		});
	}
}
