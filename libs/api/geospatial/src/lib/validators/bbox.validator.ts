import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

import { BBox } from '../models/bbox';

@ValidatorConstraint()
export class IsBBox implements ValidatorConstraintInterface {
	validate({ topLeft, bottomRight }: BBox): boolean {
		return topLeft.lat >= bottomRight.lat && topLeft.lon <= bottomRight.lon;
	}
}
