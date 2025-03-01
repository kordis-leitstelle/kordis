import { FormBuilder } from '@angular/forms';

import {
	involvementTimeRangeValidator,
	involvementsTimeIntersectingValidator,
} from './involvements.validator';

describe('InvolvementsTimeRangeValidator', () => {
	const fb = new FormBuilder();

	it('should return outOfRange error when involvement time is out of operation range', () => {
		const rangeStart = new Date('2022-01-01T10:00:00');
		const rangeEnd = new Date('2022-01-01T11:30:00');

		const formArray = fb.array([
			fb.group(
				{
					start: fb.control(new Date('2022-01-01T09:00:00')), // beginning outside of range
					end: fb.control(new Date('2022-01-01T10:40:00')),
				},
				{
					validators: involvementTimeRangeValidator(rangeStart, rangeEnd),
				},
			),
			fb.group(
				{
					start: fb.control(new Date('2022-01-01T10:50:00')),
					end: fb.control(new Date('2022-01-01T11:40:00')), //end outside of range
				},
				{
					validators: involvementTimeRangeValidator(rangeStart, rangeEnd),
				},
			),
			fb.group(
				{
					// inside
					start: fb.control(new Date('2022-01-01T10:50:00')),
					end: fb.control(new Date('2022-01-01T11:30:00')),
				},
				{
					validators: involvementTimeRangeValidator(rangeStart, rangeEnd),
				},
			),
			fb.group(
				{
					// freshly added field
					start: null,
					end: null,
				},
				{
					validators: involvementTimeRangeValidator(rangeStart, rangeEnd),
				},
			),
		]);

		expect(formArray.valid).toBeFalsy();
		expect(formArray.controls[0].errors?.outOfRange).toBeTruthy();
		expect(formArray.controls[1].errors?.outOfRange).toBeTruthy();
		expect(formArray.controls[2].errors?.outOfRange).toBeFalsy();
	});

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
});
