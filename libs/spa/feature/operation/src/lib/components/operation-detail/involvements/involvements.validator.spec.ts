import { FormBuilder } from '@angular/forms';

import {
	involvementsTimeIntersectingValidator,
	isOutOfRangeValidator,
} from './involvements.validator';

describe('InvolvementsTimeRangeValidator', () => {
	const fb = new FormBuilder();

	it('should return intersectingTimes error when there are intersecting times within the involvement times', () => {
		const formArray = fb.array(
			[
				fb.group({
					start: fb.control(new Date('2022-01-01T10:00:00')),
					end: fb.control(new Date('2022-01-01T10:40:00')),
				}),
				fb.group({
					start: fb.control(new Date('2022-01-01T10:30:00')),
					end: fb.control(new Date('2022-01-01T11:30:00')),
				}),
			],
			{
				validators: involvementsTimeIntersectingValidator,
			},
		);

		expect(formArray.errors?.intersectingTimes).toBeTruthy();
	});

	it('should return outOfRange error when there are out of range times within the involvement times', () => {
		const control = fb.control(
			new Date('2022-01-01T10:00:00'),
			isOutOfRangeValidator(
				new Date('2022-01-01T10:10:00'),
				new Date('2022-01-01T10:30:00'),
			),
		);

		expect(control.errors?.outOfRange).toBeTruthy();
	});
});
