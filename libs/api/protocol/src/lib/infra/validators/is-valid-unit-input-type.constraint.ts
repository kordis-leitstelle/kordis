import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

import { UnitInput, UnitInputType } from '../view-model/unit-input.view-model';

@ValidatorConstraint()
export class IsValidUnitInputType implements ValidatorConstraintInterface {
	validate(inputType: UnitInputType, { object }: ValidationArguments): boolean {
		const unitInput = object as UnitInput;

		if (inputType === UnitInputType.REGISTERED_UNIT) {
			return unitInput.name === undefined;
		} else if (inputType === UnitInputType.UNKNOWN_UNIT) {
			return unitInput.id === undefined;
		}

		return false;
	}
}
