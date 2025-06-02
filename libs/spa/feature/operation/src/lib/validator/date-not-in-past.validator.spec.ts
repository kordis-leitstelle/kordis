import { FormControl } from '@angular/forms';

import { dateNotInPastValidator } from './date-not-in-past.validator';

describe('dateNotInPastValidator', () => {
	it('should return null if the date is in the past', () => {
		const control = new FormControl(new Date('2023-01-01'));
		expect(dateNotInPastValidator(control)).toBeNull();
	});

	it('should return null if the date is today', () => {
		const control = new FormControl(new Date());
		expect(dateNotInPastValidator(control)).toBeNull();
	});

	it('should return an error if the date is in the future', () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		const control = new FormControl(futureDate);
		expect(dateNotInPastValidator(control)).toEqual({ dateInPast: true });
	});

	it('should return null if the control value is null', () => {
		const control = new FormControl(null);
		expect(dateNotInPastValidator(control)).toBeNull();
	});
});
