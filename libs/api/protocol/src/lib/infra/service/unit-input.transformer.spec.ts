import { plainToInstance } from 'class-transformer';

import {
	RegisteredUnit,
	Unit,
	UnknownUnit,
} from '../../core/entity/partials/unit-partial.entity';
import { UnitInput } from '../view-model/unit-input.view-model';
import { UnitInputTransformer } from './unit-input.transformer';

const successfulCases: {
	case: string;
	input: UnitInput;
	expectedOutput: Unit;
}[] = [
	{
		case: 'unknown unit',
		input: plainToInstance(UnitInput, {
			type: 'UNKNOWN_UNIT',
			name: 'UnknwonTestUnit',
		}),
		expectedOutput: plainToInstance(UnknownUnit, { name: 'UnknwonTestUnit' }),
	},
	{
		case: 'registered unit',
		input: plainToInstance(UnitInput, {
			type: 'REGISTERED_UNIT',
			id: '66622000cd0f5780cf0c0046',
		}),
		expectedOutput: plainToInstance(RegisteredUnit, {
			unit: { id: '66622000cd0f5780cf0c0046' },
		}),
	},
];

const unsuccessfulCases: { case: string; input: UnitInput }[] = [
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

describe('UnitInputTransformer', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	test.each(successfulCases)(
		'Case "$case" should be successful',
		async ({ input, expectedOutput }) => {
			const result = await UnitInputTransformer.transform(input);

			expect(result).toEqual(expectedOutput);
		},
	);

	test.each(unsuccessfulCases)(
		'Case "$case" should throw',
		async ({ input }) => {
			await expect(
				async () => await UnitInputTransformer.transform(input),
			).rejects.toThrow();
		},
	);
});
