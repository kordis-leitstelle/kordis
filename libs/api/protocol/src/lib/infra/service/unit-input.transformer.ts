import { plainToInstance } from 'class-transformer';

import {
	RegisteredUnit,
	UnknownUnit,
} from '../../core/entity/partials/unit-partial.entity';
import { UnitInput, UnitInputType } from '../view-model/unit-input.view-model';

export class UnitInputTransformer {
	static async transform(
		input: UnitInput,
	): Promise<RegisteredUnit | UnknownUnit> {
		await input.validOrThrow();

		switch (input.type) {
			case UnitInputType.REGISTERED_UNIT:
				return plainToInstance(RegisteredUnit, { unit: { id: input.id } });
			case UnitInputType.UNKNOWN_UNIT:
				return plainToInstance(UnknownUnit, { name: input.name });
			default:
				throw new Error(`Invalid UnitInputType ${input.type}`);
		}
	}
}
