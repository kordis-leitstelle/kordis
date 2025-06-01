import {
	AbstractControl,
	FormControl,
	ValidationErrors,
	ValidatorFn,
} from '@angular/forms';

export const nameOrStreetRequiredValidator: ValidatorFn = (
	group: AbstractControl<{ name: FormControl; street: FormControl }>,
): ValidationErrors | null => {
	const nameControl = group.get('name');
	const streetControl = group.get('street');

	if (!nameControl?.value && !streetControl?.value) {
		nameControl?.setErrors({ streetAndNameEmpty: true });
		streetControl?.setErrors({ streetAndNameEmpty: true });
		return { streetAndNameEmpty: true };
	}

	// Clear errors if validation passes
	nameControl?.setErrors(null);
	streetControl?.setErrors(null);

	return null;
};
