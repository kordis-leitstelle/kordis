import { FormArray, FormBuilder } from '@angular/forms';

import { involvementsTimeRangeValidator } from './involvements.validator';

describe('InvolvementsTimeRangeValidator', () => {
	let formArray: FormArray;
	let rangeStart: Date;
	let rangeEnd: Date;

	beforeEach(() => {
		const fb = new FormBuilder();
		rangeStart = new Date('2022-01-01T10:00:00');
		rangeEnd = new Date('2022-01-01T11:30:00');
		formArray = fb.array(
			[
				fb.group({
					start: fb.control(new Date('2022-01-01T10:00:00')),
					end: fb.control(new Date('2022-01-01T10:40:00')),
				}),
				fb.group({
					start: fb.control(new Date('2022-01-01T10:50:00')),
					end: fb.control(new Date('2022-01-01T11:30:00')),
				}),
			],
			{
				validators: involvementsTimeRangeValidator(rangeStart, rangeEnd),
			},
		);
	});

	it('should have no errors', () => {
		expect(formArray.errors).toBeNull();
	});

	it('should return outOfRange error when involvement time is out of operation range', () => {
		formArray.setValue([
			{
				start: new Date('2022-01-01T09:00:00'),
				end: new Date('2022-01-01T10:40:00'),
			},
			{
				start: new Date('2022-01-01T10:50:00'),
				end: new Date('2022-01-01T11:30:00'),
			},
		]);
		expect(formArray.errors?.outOfRange).toBeTruthy();
	});

	it('should return intersectingTimes error when there are intersecting times within the involvement times', () => {
		formArray.setValue([
			{
				start: new Date('2022-01-01T10:00:00'),
				end: new Date('2022-01-01T10:40:00'),
			},
			{
				start: new Date('2022-01-01T10:30:00'),
				end: new Date('2022-01-01T11:30:00'),
			},
		]);
		expect(formArray.errors?.intersectingTimes).toBeTruthy();
	});
});
