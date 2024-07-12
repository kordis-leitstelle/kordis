import {
	AbstractControl,
	FormControl,
	FormGroup,
	ValidationErrors,
} from '@angular/forms';

export const minStrengthValidator = (
	control: AbstractControl,
): ValidationErrors | null => {
	const group = control as FormGroup<{
		leaders: FormControl<number>;
		subLeaders: FormControl<number>;
		helpers: FormControl<number>;
	}>;

	const { leaders, subLeaders, helpers } = group.controls;
	const totalStrength = leaders.value + subLeaders.value + helpers.value;
	return totalStrength > 0 ? null : { totalStrengthInvalid: true };
};
