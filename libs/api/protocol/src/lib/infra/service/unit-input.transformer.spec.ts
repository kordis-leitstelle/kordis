import { plainToInstance } from 'class-transformer';

import {
	RegisteredUnit,
	Unit,
	UnknownUnit,
} from '../../core/entity/partials/unit-partial.entity';
import { UnitInput } from '../view-model/unit-input.view-model';
import { UnitInputTransformer } from './unit-input.transformer';

const cases: {
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

describe('UnitInputTransformer', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	test.each(cases)(
		'Case "$case" should be successful',
		async ({ input, expectedOutput }) => {
			const result = await UnitInputTransformer.transform(input);

			expect(result).toEqual(expectedOutput);
		},
	);
});
