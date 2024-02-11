import { createMock } from '@golevelup/ts-jest';
import { ValidationArguments } from 'class-validator';

import { IsOneOf } from './one-of.validator';

describe('IsOneOf Validator', () => {
	const isOneOfValidator = new IsOneOf();
	it('should return true for a valid value', () => {
		expect(
			isOneOfValidator.validate(
				1,
				createMock<ValidationArguments>({
					constraints: [1, 2, 3],
				}),
			),
		).toBe(true);
	});

	it('should return false for an invalid value', () => {
		expect(
			isOneOfValidator.validate(
				4,
				createMock<ValidationArguments>({
					constraints: [1, 2, 3],
				}),
			),
		).toBe(false);
	});
});
