import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

import { UnitInvolvementsFormArray } from './form/unit/operation-unit-involvement-times.component';

/*
 * Validates that unit involvement times do not intersect with each other
 */
export function involvementsTimeIntersectingValidator(
	control: AbstractControl,
): ValidationErrors | null {
	const formArray = control as UnitInvolvementsFormArray;
	const involvementTimes = formArray.getRawValue();

	involvementTimes.sort(
		(a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0),
	);

	for (let i = 0; i < involvementTimes.length; i++) {
		// check for any intersections within the times
		if (
			involvementTimes[i].end &&
			i < involvementTimes.length - 1 &&
			involvementTimes[i + 1].start &&
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			involvementTimes[i].end! > involvementTimes[i + 1].start!
		) {
			formArray.controls[i].controls.end.setErrors({
				intersectingTimes: true,
			});

			formArray.controls[i + 1].controls.start.setErrors({
				intersectingTimes: true,
			});

			return {
				intersectingTimes: true,
			};
		}
	}

	return null;
}

export function isOutOfRangeValidator(
	start: Date,
	end: Date | null,
): (control: AbstractControl) => ValidationErrors | null {
	return (control: AbstractControl): ValidationErrors | null => {
		const { value } = control as FormControl<Date | null>;

		if (value && (value < start || (end && value > end))) {
			return { outOfRange: true };
		}

		return null;
	};
}
