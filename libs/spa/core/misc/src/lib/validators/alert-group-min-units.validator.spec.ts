import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { alertGroupMinUnitsValidator } from './alert-group-min-units.validator';

describe('alertGroupMinUnitsValidator', () => {
	it('should return null if the FormArray contains a group with assigned units', () => {
		const formGroup = new FormGroup({
			assignedUnits: new FormControl(['unit1']),
		});
		const formArray = new FormArray([formGroup]);

		const result = alertGroupMinUnitsValidator(formArray);
		expect(result).toBeNull();
	});

	it('should return an error object if the FormArray contains a group without assigned units', () => {
		const formGroup = new FormGroup({
			assignedUnits: new FormControl([]),
		});
		const formArray = new FormArray([formGroup]);

		const result = alertGroupMinUnitsValidator(formArray);
		expect(result).toEqual({ minUnitsInvalid: true });
	});

	it('should return null if the FormArray is empty', () => {
		const formArray = new FormArray([]);

		const result = alertGroupMinUnitsValidator(formArray);
		expect(result).toBeNull();
	});
});
