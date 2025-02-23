import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { createMock } from '@golevelup/ts-jest';

import { GeoSearchService } from '@kordis/spa/core/geocoding';

import { OperationPatientDataFormComponent } from './operation-patient-data-form.component';

describe('PatientDataComponent', () => {
	let fixture: ComponentFixture<OperationPatientDataFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationPatientDataFormComponent],
			providers: [
				{
					provide: GeoSearchService,
					useValue: createMock(),
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationPatientDataFormComponent);
	});

	it('should create', () => {
		fixture.componentRef.setInput(
			'formGroup',
			new FormGroup({
				firstName: new FormControl(''),
				lastName: new FormControl(''),
				birthDate: new FormControl(null),
				phoneNumber: new FormControl(''),
				whereabouts: new FormControl(''),
				address: new FormGroup({
					street: new FormControl(''),
					city: new FormControl(''),
					postalCode: new FormControl(''),
				}),
			}),
		);

		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});
});
