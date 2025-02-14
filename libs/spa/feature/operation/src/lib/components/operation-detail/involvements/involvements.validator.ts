import {
	AbstractControl,
	FormControl,
	FormGroup,
	ValidationErrors,
} from '@angular/forms';

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

/*
 * Validates that the involvement time is not out of the operation time range
 */
export function involvementTimeRangeValidator(
	rangeStart: Date,
	rangeEnd: Date | null,
) {
	return (control: AbstractControl): ValidationErrors | null => {
		const formGroup = control as FormGroup<{
			start: FormControl<Date>;
			end: FormControl<Date | null>;
		}>;
		const involvementTime = formGroup.getRawValue();

		if (
			// if start is before operation start
			involvementTime.start < rangeStart
		) {
			formGroup.controls.start.setErrors({
				outOfRange: true,
			});
			return { outOfRange: true };
		} else if (
			// or if end is after operation end
			involvementTime.end &&
			rangeEnd &&
			involvementTime.end > rangeEnd
		) {
			formGroup.controls.end.setErrors({
				outOfRange: true,
			});
			return { outOfRange: true };
		}

		return null;
	};
}
