import { FormControl, FormGroup } from '@angular/forms';

import { minStrengthValidator } from './min-strength.validator';

describe('minStrengthValidator', () => {
	it('should return null if the total strength is greater than 0', () => {
		const formGroup = new FormGroup({
			leaders: new FormControl(1),
			subLeaders: new FormControl(1),
			helpers: new FormControl(1),
		});

		const result = minStrengthValidator(formGroup);
		expect(result).toBeNull();
	});

	it('should return an error object if the total strength is 0', () => {
		const formGroup = new FormGroup({
			leaders: new FormControl(0),
			subLeaders: new FormControl(0),
			helpers: new FormControl(0),
		});

		const result = minStrengthValidator(formGroup);
		expect(result).toEqual({ totalStrengthInvalid: true });
	});
});
