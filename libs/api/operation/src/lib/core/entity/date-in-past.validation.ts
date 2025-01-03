import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';


@ValidatorConstraint({ name: 'DateInPast', async: false })
export class DateInPastValidation implements ValidatorConstraintInterface {
	validate(args: ValidationArguments): boolean {
		return (args.value as Date) <= new Date();
	}

	defaultMessage(): string {
		return 'Das Datum muss in der Vergangenheit liegen.';
	}
}
