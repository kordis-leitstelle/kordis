import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

import { StartEndValidatable } from './operation.value-objects';


@ValidatorConstraint({ name: 'EndAfterStart', async: false })
export class EndAfterStartValidation implements ValidatorConstraintInterface {
	validate(end: Date, args: ValidationArguments): boolean {
		return (args.object as StartEndValidatable).start < end;
	}

	defaultMessage(): string {
		return 'Das Ende muss nach dem Start liegen.';
	}
}
