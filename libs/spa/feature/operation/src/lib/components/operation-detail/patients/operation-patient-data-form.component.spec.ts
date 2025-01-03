import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationPatientDataFormComponent } from './operation-patient-data-form.component';

describe('PatientDataComponent', () => {
	let component: OperationPatientDataFormComponent;
	let fixture: ComponentFixture<OperationPatientDataFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationPatientDataFormComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationPatientDataFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
