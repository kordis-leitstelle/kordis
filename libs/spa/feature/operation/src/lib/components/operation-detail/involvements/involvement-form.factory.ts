import { Injectable, inject } from '@angular/core';
import {
	FormArray,
	FormGroup,
	NonNullableFormBuilder,
	Validators,
} from '@angular/forms';

import {
	AlertGroup,
	Operation,
	OperationUnitInvolvement,
} from '@kordis/shared/model';

import { dateNotInPastValidator } from '../../../validator/date-not-in-past.validator';
import { startBeforeEndValidator } from '../../../validator/start-before-end.validator';
import { AlertGroupInvolvementFormGroup } from './form/alert-group/operation-alert-group-involvements-form.component';
import {
	InvolvementTimeFormGroup,
	UnitInvolvementFormGroup,
} from './form/unit/operation-unit-involvement-times.component';
import { InvolvementOperationTimeState } from './involvement-operation-time.state';
import {
	involvementsTimeIntersectingValidator,
	isOutOfRangeValidator,
} from './involvements.validator';

export type InvolvementFormGroup = FormGroup<{
	unitInvolvements: FormArray<UnitInvolvementFormGroup>;
	alertGroupInvolvements: FormArray<AlertGroupInvolvementFormGroup>;
}>;

@Injectable()
export class InvolvementFormFactory {
	private readonly fb = inject(NonNullableFormBuilder);
	private readonly operationTimeState = inject(InvolvementOperationTimeState);

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
				),
			),
		);
	}

	createAlertGroupInvolvementFormGroup(
		alertGroup: AlertGroup,
		unitInvolvements: OperationUnitInvolvement[],
	): AlertGroupInvolvementFormGroup {
		return this.fb.group({
			alertGroup: this.fb.control(alertGroup),
			unitInvolvements: this.createUnitInvolvementsFormArray(unitInvolvements),
		});
	}

	createUnitInvolvementsFormArray(
		unitInvolvements: OperationUnitInvolvement[],
	): FormArray<UnitInvolvementFormGroup> {
		return this.fb.array<UnitInvolvementFormGroup>(
			unitInvolvements.map((unitInvolvement) =>
				this.createUnitInvolvementFormGroup(unitInvolvement),
			),
		);
	}

	createInvolvementTimeFormGroup(
		start: Date | null,
		end: Date | null,
	): InvolvementTimeFormGroup {
		return this.fb.group(
			{
				start: this.fb.control<Date | null>(start ? new Date(start) : null, [
					isOutOfRangeValidator(
						this.operationTimeState.operationStart,
						this.operationTimeState.operationEnd,
					),
					Validators.required,
				]),
				end: this.fb.control(end ? new Date(end) : null, [
					dateNotInPastValidator,
					...(this.operationTimeState.operationEnd
						? [
								Validators.required,
								isOutOfRangeValidator(
									this.operationTimeState.operationStart,
									this.operationTimeState.operationEnd,
								),
							]
						: []),
				]),
			},
			{
				validators: startBeforeEndValidator,
			},
		);
	}

	createUnitInvolvementFormGroup(
		unitInvolvement: OperationUnitInvolvement,
	): UnitInvolvementFormGroup {
		return this.fb.group({
			unit: this.fb.control(unitInvolvement.unit),
			isPending: this.fb.control(unitInvolvement.isPending),
			involvementTimes: this.fb.array(
				unitInvolvement.involvementTimes.map((time) =>
					this.createInvolvementTimeFormGroup(time.start, time.end),
				),
				{
					validators: involvementsTimeIntersectingValidator,
				},
			),
		});
	}
}
