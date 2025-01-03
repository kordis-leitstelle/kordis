import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateInPastValidator: ValidatorFn = (
	dateControl: AbstractControl<Date>,
): ValidationErrors | null => {
	if (dateControl.value <= new Date()) {
		return null;
	}

	return { dateNotInPast: true };
};
