import { plainToInstance } from 'class-transformer';

import { UnitInput, UnitInputType } from '../view-model/unit-input.view-model';
import { IsValidUnitInputType } from './is-valid-unit-input-type.constraint';

const validUnitInputs: UnitInput[] = [
	plainToInstance(UnitInput, {
		type: UnitInputType.REGISTERED_UNIT,
		id: 'someUnitId',
	}),
	plainToInstance(UnitInput, {
		type: UnitInputType.UNKNOWN_UNIT,
		name: 'someUnitName',
	}),
];

describe('Valid UnitInputType Validator', () => {
	const unitInputValidator = new IsValidUnitInputType();
	test.each(validUnitInputs)('should return true for valid UnitInputs', () => {
		const unitInput = new UnitInput();
		unitInput.type = UnitInputType.REGISTERED_UNIT;
		unitInput.id = 'someId';

		expect(unitInputValidator.validate(unitInput)).toBe(true);
	});

	it('should return false for an invalid UnitInput', () => {
		const invalidUnitInput = new UnitInput();
		invalidUnitInput.type = UnitInputType.REGISTERED_UNIT;
		invalidUnitInput.name = 'someName';

		expect(unitInputValidator.validate(invalidUnitInput)).toBe(false);
	});
});
