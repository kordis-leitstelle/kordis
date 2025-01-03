import { TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, NonNullableFormBuilder } from '@angular/forms';

import { makeOperationLocationForm } from './operation-address-form.factory';

describe('makeOperationLocationForm', () => {
	let formBuilder: NonNullableFormBuilder;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
		});

		formBuilder = TestBed.inject(NonNullableFormBuilder);
	});

	it('should return a FormGroup', () => {
		const result = makeOperationLocationForm(formBuilder);
		expect(result).toBeInstanceOf(FormGroup);
	});
});
