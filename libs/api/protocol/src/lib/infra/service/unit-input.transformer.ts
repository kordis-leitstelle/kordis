import { plainToClass } from 'class-transformer';

import {
	RegisteredUnit,
	UnknownUnit,
} from '../../core/entity/partials/unit-partial.entity';
import { UnitInput, UnitInputType } from '../view-model/unit-input.view-model';

export class UnitInputTransformer {
	static transform(input: UnitInput): RegisteredUnit | UnknownUnit {
		switch (input.type) {
			case UnitInputType.REGISTERED_UNIT:
				return plainToClass(RegisteredUnit, { unit: { id: input.id } });
			case UnitInputType.UNKNOWN_UNIT:
				return plainToClass(UnknownUnit, { name: input.name });
			default:
				throw new Error(`Invalid UnitInputType ${input.type}`);
		}
	}
}
