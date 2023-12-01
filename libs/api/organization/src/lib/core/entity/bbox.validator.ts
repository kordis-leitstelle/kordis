import type { ValidatorConstraintInterface } from 'class-validator';
import { ValidatorConstraint } from 'class-validator';

import type { BBox } from './organization.entity';

@ValidatorConstraint()
export class IsBBox implements ValidatorConstraintInterface {
	validate({ topLeft, bottomRight }: BBox): boolean {
		return topLeft.lat >= bottomRight.lat && topLeft.lon <= bottomRight.lon;
	}
}
