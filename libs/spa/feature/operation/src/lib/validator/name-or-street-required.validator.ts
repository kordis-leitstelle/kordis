import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const nameOrStreetRequiredValidator: ValidatorFn = (
	group: AbstractControl,
): ValidationErrors | null => {
	if (!group.get('name')?.value && !group.get('street')?.value) {
		if (!group.get('name')?.value) {
			group.get('name')?.setErrors({ invalid: true });
		}
		if (!group.get('street')?.value) {
			group.get('street')?.setErrors({ invalid: true });
		}
		return { streetAndNameEmpty: true };
	}

	return null;
};
