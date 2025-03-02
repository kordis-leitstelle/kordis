import { validate } from 'class-validator';

import { ValidationException } from '../exceptions/core/validation.exception';
import { Validatable } from './validatable.model';

declare function fail(error?: any): never;

jest.mock('class-validator', () => ({
	validate: jest.fn(),
}));

describe('ValidatableModel', () => {
	class ProxyValidatable extends Validatable {}

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should throw ValidationException when there are validation errors', async () => {
		const model = new ProxyValidatable();
		(validate as jest.Mock).mockResolvedValue([
			{
				property: 'name',
				constraints: {
					isNotEmpty: 'Name should not be empty',
				},
			},
		]);

		let error: any;
		try {
			await model.validOrThrow();
			fail('Expected validation to throw an exception');
		} catch (e) {
			error = e;
		} finally {
			expect(error).toBeInstanceOf(ValidationException);
			expect(error.message).toBe('ProxyValidatable validation failed.');
			expect(error.errors).toEqual([
				{ path: ['name'], errors: ['Name should not be empty'] },
			]);
		}

		expect(validate).toHaveBeenCalledWith(model, { groups: undefined });
	});

	it('should not throw any exception when there are no validation errors', async () => {
		const model = new ProxyValidatable();
		(validate as jest.Mock).mockResolvedValue([]);

		await expect(model.validOrThrow()).resolves.toBeUndefined();
		expect(validate).toHaveBeenCalledWith(model, { groups: undefined });
	});
});
