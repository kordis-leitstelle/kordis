import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { markInvalidFormControlsAsDirty } from './mark-invalid-form-controls-as-dirty.helper';

describe('markInvalidFormControlsAsDirty', () => {
	it('should mark all invalid controls as dirty in a nested FormGroup and FormArray', () => {
		const formGroup = new FormGroup({
			group1: new FormGroup({
				control1: new FormControl('', { validators: [] }),
				control2: new FormControl('', { validators: [] }),
				array1: new FormArray([
					new FormControl('', { validators: [] }),
					new FormControl('', { validators: [] }),
				]),
			}),
			array1: new FormArray([
				new FormControl('', { validators: [] }),
				new FormGroup({
					control3: new FormControl('', { validators: [] }),
					control4: new FormControl('', { validators: [] }),
				}),
			]),
		});

		formGroup.get('group1.control1')?.setErrors({ required: true });
		formGroup.get('group1.array1.0')?.setErrors({ required: true });
		formGroup.get('array1.0')?.setErrors({ required: true });
		formGroup.get('array1.1.control3')?.setErrors({ required: true });

		markInvalidFormControlsAsDirty(formGroup);

		expect(formGroup.get('group1.control1')?.dirty).toBe(true);
		expect(formGroup.get('group1.control2')?.dirty).toBe(false);
		expect(formGroup.get('group1.array1.0')?.dirty).toBe(true);
		expect(formGroup.get('array1.0')?.dirty).toBe(true);
		expect(formGroup.get('array1.1.control3')?.dirty).toBe(true);
		expect(formGroup.get('array1.1.control4')?.dirty).toBe(false);
	});
});
