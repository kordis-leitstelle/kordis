import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateNotInPastValidator: ValidatorFn = (
	dateControl: AbstractControl<Date>,
): ValidationErrors | null => {
	if (dateControl.value == null || dateControl.value <= new Date()) {
		return null;
	}

	return { dateInPast: true };
};
