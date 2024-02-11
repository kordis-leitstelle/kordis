import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class IsOneOf implements ValidatorConstraintInterface {
	validate(value: number | string, args: ValidationArguments): boolean {
		return args.constraints.includes(value);
	}
}
