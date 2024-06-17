import { plainToInstance } from 'class-transformer';

import { UnitInput } from './unit-input.view-model';

const cases: { case: string; input: UnitInput }[] = [
	{
		case: 'registered unit is passed but name is set instead of id',
		input: plainToInstance(UnitInput, {
			type: 'REGISTERED_UNIT',
			name: 'TestUnit',
		}),
	},
	{
		case: 'registered unit is passed with name and set',
		input: plainToInstance(UnitInput, {
			type: 'REGISTERED_UNIT',
			name: 'TestUnit',
			id: '66622000cd0f5780cf0c0046',
		}),
	},
	{
		case: 'unknown unit is passed but id is set instead of name',
		input: plainToInstance(UnitInput, {
			type: 'UNKNOWN_UNIT',
			id: '66622000cd0f5780cf0c0046',
		}),
	},
	{
		case: 'unknown unit is passed with id and name set',
		input: plainToInstance(UnitInput, {
			type: 'UNKNOWN_UNIT',
			id: '66622000cd0f5780cf0c0046',
			name: 'TestUnit',
		}),
	},
	{
		case: 'invalid unit type is passed in',
		input: plainToInstance(UnitInput, {
			type: 'INVALID_TYPE',
		}),
	},
];

describe('UnitInput', () => {
	describe('Validation', () => {
		test.each(cases)('Case "$case" should throw', async ({ input }) => {
			await expect(input.validOrThrow()).rejects.toThrow();
		});
	});
});
