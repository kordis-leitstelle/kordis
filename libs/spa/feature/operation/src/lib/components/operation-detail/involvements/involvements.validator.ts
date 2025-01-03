import {
	AbstractControl,
	FormControl,
	FormGroup,
	ValidationErrors,
} from '@angular/forms';

import { UnitInvolvementsFormArray } from './form/unit/operation-unit-involvement-times.component';

export function involvementsTimeRangeValidator(
	rangeStart: Date,
	rangeEnd: Date | null,
) {
	return (control: AbstractControl): ValidationErrors | null => {
		const formArray = control as UnitInvolvementsFormArray;
		const involvementTimes = formArray.getRawValue();

		involvementTimes.sort((a, b) => a.start.getTime() - b.start.getTime());

		for (let i = 0; i < involvementTimes.length; i++) {
			// check for any intersections within the times
			if (
				i < involvementTimes.length - 1 &&
				involvementTimes[i].end &&
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				involvementTimes[i].end! > involvementTimes[i + 1].start
			) {
				return {
					intersectingTimes: true,
				};
			}
		}

		return null;
	};
}

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
		console.log(involvementTime.start, rangeStart);
		console.log(involvementTime.start < rangeStart);
		if (
			involvementTime.start < rangeStart ||
			(involvementTime.end &&
				rangeEnd &&
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				involvementTime.end! > rangeEnd)
		) {
			console.log('out of range');
			return { outOfRange: true };
		}

		if (involvementTime.end && involvementTime.end > new Date()) {
			console.log('end date is in the future');
			return { endIsFuture: true };
		}
		return null;
	};
}

export function maxDateValidator(maxDate: Date, ignoreNull = false) {
	return (control: AbstractControl): ValidationErrors | null => {
		if (control.value === null && ignoreNull) {
			return null;
		}
		if (control.value > maxDate) {
			return { maxDate: true };
		}
		return null;
	};
}
