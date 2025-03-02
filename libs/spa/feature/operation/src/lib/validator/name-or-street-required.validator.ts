import {
	AbstractControl,
	FormControl,
	ValidationErrors,
	ValidatorFn,
} from '@angular/forms';

export const nameOrStreetRequiredValidator: ValidatorFn = (
	group: AbstractControl<{ name: FormControl; street: FormControl }>,
): ValidationErrors | null => {
	if (!group.get('name')?.value && !group.get('street')?.value) {
		group.get('name')?.setErrors({ streetAndNameEmpty: true });
		group.get('street')?.setErrors({ streetAndNameEmpty: true });
		return { streetAndNameEmpty: true };
	}

	return null;
};
