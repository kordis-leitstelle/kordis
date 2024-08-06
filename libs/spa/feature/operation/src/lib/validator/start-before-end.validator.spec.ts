import { FormControl, FormGroup } from '@angular/forms';

import { startBeforeEndValidator } from './start-before-end.validator';

describe('startBeforeEndValidator', () => {
	it('should not return an error if start date is before end date', () => {
		const form = new FormGroup({
			start: new FormControl(new Date('2023-01-01')),
			end: new FormControl(new Date('2023-01-02')),
		});

		expect(startBeforeEndValidator(form)).toBeNull();
	});

	it('should return an error if start date is after end date', () => {
		const form = new FormGroup({
			start: new FormControl(new Date('2023-01-03')),
			end: new FormControl(new Date('2023-01-02')),
		});

		const result = startBeforeEndValidator(form);
		expect(result).toEqual({ dateRangeInvalid: true });
	});

	it('should return an error if start date is the same as end date', () => {
		const form = new FormGroup({
			start: new FormControl(new Date('2023-01-01')),
			end: new FormControl(new Date('2023-01-01')),
		});

		const result = startBeforeEndValidator(form);
		expect(result).toEqual({ dateRangeInvalid: true });
	});

	it('should not return an error if end date is not set', () => {
		const form = new FormGroup({
			start: new FormControl(new Date('2023-01-01')),
			end: new FormControl(null),
		});

		expect(startBeforeEndValidator(form)).toBeNull();
	});
});
