import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { getTopLevelDirtyValues } from './get-top-level-dirty-values.helper';

describe('getTopLevelDirtyValues', () => {
	it('should return only the dirty values, including nested FormGroup and FormArray values', () => {
		const formGroup = new FormGroup({
			cleanControl: new FormControl('clean value'),
			dirtyControl: new FormControl('dirty value'),
			nestedGroup: new FormGroup({
				nestedCleanControl: new FormControl('nested clean value'),
				nestedDirtyControl: new FormControl('nested dirty value'),
			}),
			arrayControl: new FormArray([
				new FormControl('clean array value'),
				new FormControl('dirty array value'),
			]),
		});

		formGroup.controls.dirtyControl.markAsDirty();
		formGroup.controls.nestedGroup.controls.nestedCleanControl.markAsDirty();
		formGroup.controls.arrayControl.at(1).markAsDirty();

		const result = getTopLevelDirtyValues(formGroup);

		expect(result).toEqual({
			dirtyControl: 'dirty value',
			nestedGroup: {
				nestedCleanControl: 'nested clean value',
				nestedDirtyControl: 'nested dirty value',
			},
			arrayControl: ['clean array value', 'dirty array value'],
		});
	});
});
