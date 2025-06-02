import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	Validators,
} from '@angular/forms';

import {
	CreateOngoingOperationInput,
	CreateOperationInput,
	Unit,
} from '@kordis/shared/model';
import {
	AlertGroupAssignmentFormGroup,
	alertGroupMinUnitsValidator,
} from '@kordis/spa/core/misc';

import { atLeastOneUnitOrAlertGroupValidator } from '../validator/at-least-one-unit-or-alert-group.validator';
import { dateNotInPastValidator } from '../validator/date-not-in-past.validator';
import { nameOrStreetRequiredValidator } from '../validator/name-or-street-required.validator';
import { startBeforeEndValidator } from '../validator/start-before-end.validator';
import {
	OperationLocationFormGroup,
	makeOperationLocationForm,
} from './operation-address-form.factory';

export type CreateOperationFormGroup = FormGroup<{
	start: FormControl<Date>;
	end: FormControl<Date | null>;
	location: OperationLocationFormGroup;
	alarmKeyword: FormControl<string>;
	description: FormControl<string>;
	units: FormControl<Unit[]>;
	alertGroups: FormArray<AlertGroupAssignmentFormGroup>;
}>;

export function makeCreateOperationForm(
	fb: NonNullableFormBuilder,
	endDisabled?: boolean,
): CreateOperationFormGroup {
	return fb.group(
		{
			start: fb.control(new Date(), [
				Validators.required,
				dateNotInPastValidator,
			]),
			end: fb.control<Date | null>(
				{
					value: null,
					disabled: !!endDisabled,
				},
				[Validators.required, dateNotInPastValidator],
			),
			location: makeOperationLocationForm(fb, {
				address: [nameOrStreetRequiredValidator],
			}),
			alarmKeyword: fb.control('', Validators.required),
			description: fb.control(''),
			units: fb.control<Unit[]>([]),
			alertGroups: fb.array<AlertGroupAssignmentFormGroup>(
				[],
				alertGroupMinUnitsValidator,
			),
		},
		{
			validators: [
				startBeforeEndValidator,
				atLeastOneUnitOrAlertGroupValidator,
			],
		},
	);
}

export function getOperationPayloadFromForm(
	formGroup: CreateOperationFormGroup,
): CreateOperationInput | CreateOngoingOperationInput {
	const formData = formGroup.getRawValue();
	const end = formData.end?.toISOString();
	return {
		start: formData.start.toISOString(),
		end,
		alarmKeyword: formData.alarmKeyword,
		location: {
			...formData.location,
			coordinate:
				formData.location?.coordinate?.lat && formData.location?.coordinate?.lon
					? {
							lat: formData.location.coordinate.lat,
							lon: formData.location.coordinate.lon,
						}
					: null,
		},
		assignedUnitIds: formData.units.map((unit) => unit.id),
		assignedAlertGroups: formData.alertGroups.map((assignment) => ({
			alertGroupId: assignment.alertGroup.id,
			assignedUnitIds: assignment.assignedUnits.map((unit) => unit.id),
		})),
	};
}
