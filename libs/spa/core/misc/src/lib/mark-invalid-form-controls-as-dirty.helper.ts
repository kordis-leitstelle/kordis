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

/*
 * Marks all **invalid** form controls of a group or array as dirty. Also checks the children of a group and each entry of an array recursively.
 * If a parent is invalid, the children will not be marked as dirty, only the first invalid control in the tree will be marked as dirty.
 */
export function markInvalidFormControlsAsDirty(
	formGroup: FormGroup | FormArray,
): void {
	if (formGroup instanceof FormGroup) {
		Object.values(formGroup.controls).forEach(markControlAsDirty);
	} else {
		formGroup.controls.forEach(markControlAsDirty);
	}
}
