import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'DateInPast', async: false })
export class DateInPastValidation implements ValidatorConstraintInterface {
	validate(date: Date): boolean {
		return date <= new Date();
	}

	defaultMessage(): string {
		return 'Das Datum muss in der Vergangenheit liegen.';
	}
}
