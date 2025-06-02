import { FormControl, FormGroup } from '@angular/forms';

import { nameOrStreetRequiredValidator } from './name-or-street-required.validator';

describe('nameOrStreetRequiredValidator', () => {
	it('should return null if either name or street is provided', () => {
		const group = new FormGroup({
			name: new FormControl('Test Name'),
			street: new FormControl(''),
		});
		expect(nameOrStreetRequiredValidator(group)).toBeNull();

		group.patchValue({ name: '', street: 'Test Street' });
		expect(nameOrStreetRequiredValidator(group)).toBeNull();
	});

	it('should return an error if both name and street are empty', () => {
		const group = new FormGroup({
			name: new FormControl(''),
			street: new FormControl(''),
		});
		expect(nameOrStreetRequiredValidator(group)).toEqual({
			streetAndNameEmpty: true,
		});
		expect(group.get('name')?.errors).toEqual({ streetAndNameEmpty: true });
		expect(group.get('street')?.errors).toEqual({ streetAndNameEmpty: true });
	});

	it('should clear errors if name or street is later provided', () => {
		const group = new FormGroup({
			name: new FormControl(''),
			street: new FormControl(''),
		});

		nameOrStreetRequiredValidator(group);
		group.patchValue({ name: 'Test Name' });
		expect(nameOrStreetRequiredValidator(group)).toBeNull();
		expect(group.get('name')?.errors).toBeNull();
		expect(group.get('street')?.errors).toBeNull();
	});
});
