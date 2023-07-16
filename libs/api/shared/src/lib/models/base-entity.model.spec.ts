import { validate } from 'class-validator';

import { ValidationException } from '../exceptions/core/validation.exception';
import { BaseEntityModel } from './base-entity.model';

declare function fail(error?: any): never;

jest.mock('class-validator', () => ({
	validate: jest.fn(),
}));

describe('BaseEntityModel', () => {
	class ProxyBaseEntityModel extends BaseEntityModel {}

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should throw ValidationException when there are validation errors', async () => {
		const model = new ProxyBaseEntityModel();
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
			expect(error.message).toBe('ProxyBaseEntityModel validation failed.');
			expect(error.errors).toEqual([
				{ path: ['name'], errors: ['Name should not be empty'] },
			]);
		}

		expect(validate).toHaveBeenCalledWith(model);
	});

	it('should not throw any exception when there are no validation errors', async () => {
		const model = new ProxyBaseEntityModel();
		(validate as jest.Mock).mockResolvedValue([]);

		await expect(model.validOrThrow()).resolves.toBeUndefined();
		expect(validate).toHaveBeenCalledWith(model);
	});
});
