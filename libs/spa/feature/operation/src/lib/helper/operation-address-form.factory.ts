import {
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	ValidatorFn,
	Validators,
} from '@angular/forms';

export type OperationLocationForm = FormGroup<{
	address: FormGroup<{
		name: FormControl<string>;
		postalCode: FormControl<string>;
		city: FormControl<string>;
		street: FormControl<string>;
	}>;
	coordinate: FormGroup<{
		lat: FormControl<number | null>;
		lon: FormControl<number | null>;
	}>;
}>;

export function makeOperationLocationForm(
	fb: NonNullableFormBuilder,
	validators: Partial<{
		address: ValidatorFn[];
		coordinate: ValidatorFn[];
	}> = {},
): OperationLocationForm {
	return fb.group({
		address: fb.group(
			{
				name: fb.control(''),
				street: fb.control(''),
				postalCode: fb.control(''),
				city: fb.control(''),
			},
			{
				validators: validators.address,
			},
		),
		coordinate: fb.group(
			{
				lat: fb.control<number | null>(null, [
					Validators.min(-90),
					Validators.max(90),
				]),
				lon: fb.control<number | null>(null, [
					Validators.min(-180),
					Validators.max(180),
				]),
			},
			{
				validators: validators.coordinate,
			},
		),
	});
}
