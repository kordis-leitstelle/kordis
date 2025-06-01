import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Unit } from '@kordis/shared/model';

import { atLeastOneUnitOrAlertGroupValidator } from './at-least-one-unit-or-alert-group.validator';

describe('atLeastOneUnitOrAlertGroupValidator', () => {
	it('should return null if there is at least one unit', () => {
		const formGroup = new FormGroup({
			units: new FormControl([{ id: 'someId', name: 'Unit 1' } as Unit]),
			alertGroups: new FormArray([]),
		});

		expect(atLeastOneUnitOrAlertGroupValidator(formGroup)).toBeNull();
	});

	it('should return null if there is at least one alert group', () => {
		const formGroup = new FormGroup({
			units: new FormControl([]),
			alertGroups: new FormArray([new FormGroup({ id: new FormControl(1) })]),
		});

		expect(atLeastOneUnitOrAlertGroupValidator(formGroup)).toBeNull();
	});

	it('should return an error if both units and alert groups are empty', () => {
		const formGroup = new FormGroup({
			units: new FormControl([]),
			alertGroups: new FormArray([]),
		});

		expect(atLeastOneUnitOrAlertGroupValidator(formGroup)).toEqual({
			noUnitsOrAlertGroups: true,
		});
		expect(formGroup.get('units')?.errors).toEqual({
			noUnitsOrAlertGroups: true,
		});
		expect(formGroup.get('alertGroups')?.errors).toEqual({
			noUnitsOrAlertGroups: true,
		});
	});

	it('should clear errors if a unit is added after validation fails', () => {
		const formGroup = new FormGroup({
			units: new FormControl<Unit[]>([]),
			alertGroups: new FormArray([]),
		});

		atLeastOneUnitOrAlertGroupValidator(formGroup);
		formGroup.patchValue({ units: [{ id: 'someid', name: 'Unit 1' } as Unit] });

		expect(atLeastOneUnitOrAlertGroupValidator(formGroup)).toBeNull();
		expect(formGroup.get('units')?.errors).toBeNull();
		expect(formGroup.get('alertGroups')?.errors).toBeNull();
	});
});
