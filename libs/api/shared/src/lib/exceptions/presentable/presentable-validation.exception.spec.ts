import { ValidationError } from 'class-validator';

import {
	ValidationException,
	ValidationExceptionEntry,
} from '../core/validation.exception';
import { PresentableValidationException } from '../presentable/presentable-validation.exception';

describe('PresentableValidationException', () => {
	const message = 'PresentableValidationException error message';
	const errors: ValidationExceptionEntry[] = [
		{ path: ['name'], errors: ['Name is required'] },
		{ path: ['email'], errors: ['Invalid email format'] },
	];

	it('should create a PresentableValidationException from CoreValidationException', () => {
		const coreValidationException = new ValidationException(errors);

		const exception =
			PresentableValidationException.fromCoreValidationException(
				message,
				coreValidationException,
			);

		expect(exception).toBeInstanceOf(PresentableValidationException);
		expect(exception.message).toBe(message);
		expect(
			(exception.asGraphQLError().extensions!.errors as []).sort(),
		).toEqual(errors.sort());
	});

	it('should create a PresentableValidationException from ClassValidationErrors', () => {
		const validationErrors: ValidationError[] = [
			{ property: 'name', constraints: { required: 'Name is required' } },
			{ property: 'email', constraints: { email: 'Invalid email format' } },
		];

		const exception =
			PresentableValidationException.fromClassValidationErrors(
				validationErrors,
			);

		expect(exception).toBeInstanceOf(PresentableValidationException);
		expect(exception.message).toBe('Validierungsfehler');
		expect(
			(exception.asGraphQLError().extensions!.errors as []).sort(),
		).toEqual(errors.sort());
	});
});
