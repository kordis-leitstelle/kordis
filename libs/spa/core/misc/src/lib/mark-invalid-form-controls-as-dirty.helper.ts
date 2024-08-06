import {
	AbstractControl,
	FormArray,
	FormControl,
	FormGroup,
} from '@angular/forms';

function markControlAsDirty(control: AbstractControl): void {
	if (control.valid) {
		return;
	}
	if (control instanceof FormControl) {
		control.markAsDirty();
		control.updateValueAndValidity();
	} else if (control instanceof FormGroup || control instanceof FormArray) {
		markInvalidFormControlsAsDirty(control);
	}
}

export function markInvalidFormControlsAsDirty(
	formGroup: FormGroup | FormArray,
): void {
	if (formGroup instanceof FormGroup) {
		Object.values(formGroup.controls).forEach(markControlAsDirty);
	} else {
		formGroup.controls.forEach(markControlAsDirty);
	}
}
