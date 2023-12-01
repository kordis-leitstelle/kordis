import type { ValidationExceptionEntry } from './core/validation.exception';
import { flattenValidationErrors } from './flatten-class-validation-errors';

describe('flattenValidationErrors', () => {
	it('should flatten validation errors correctly', () => {
		const errors = [
			{
				property: 'username',
				constraints: {
					isNotEmpty: 'Username should not be empty',
					maxLength: 'Username should not exceed 20 characters',
				},
				children: [
					{
						property: 'email',
						constraints: {
							isEmail: 'Email address is invalid',
						},
					},
				],
			},
		];

		const expected: ValidationExceptionEntry[] = [
			{
				path: ['username'],
				errors: [
					'Username should not be empty',
					'Username should not exceed 20 characters',
				],
			},
			{
				path: ['username', 'email'],
				errors: ['Email address is invalid'],
			},
		];

		const result = flattenValidationErrors(errors);

		expect(result).toEqual(expected);
	});
});
