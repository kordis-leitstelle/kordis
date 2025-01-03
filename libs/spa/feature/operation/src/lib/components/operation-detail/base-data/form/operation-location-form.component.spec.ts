import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NonNullableFormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { createMock } from '@golevelup/ts-jest';

import {
	GeoSearchComponent,
	GeoSearchService,
} from '@kordis/spa/core/geocoding';

import { makeOperationLocationForm } from '../../../../helper/operation-address-form.factory';
import { OperationLocationFormComponent } from './operation-location-form.component';

describe('AddressFormComponent', () => {
	let fixture: ComponentFixture<OperationLocationFormComponent>;
	let fb: NonNullableFormBuilder;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationLocationFormComponent, FormsModule],
			providers: [
				{
					provide: GeoSearchService,
					useValue: createMock<GeoSearchService>(),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationLocationFormComponent);
		fb = TestBed.inject(NonNullableFormBuilder);
	});

	it('should set value of selected location result', () => {
		const fg = makeOperationLocationForm(fb);
		fixture.componentRef.setInput('formGroup', fg);
		fixture.detectChanges();

		fixture.debugElement
			.query(By.directive(GeoSearchComponent))
			.triggerEventHandler('resultSelected', {
				displayValue: 'displayValue',
				address: {
					name: 'name',
					city: 'city',
					postalCode: 'postalCode',
					street: 'street',
				},
				coordinate: {
					lat: 1,
					lon: 2,
				},
			});

		expect(fg.value).toEqual({
			address: {
				name: 'name',
				city: 'city',
				postalCode: 'postalCode',
				street: 'street',
			},
			coordinate: {
				lat: 1,
				lon: 2,
			},
		});
	});
});
