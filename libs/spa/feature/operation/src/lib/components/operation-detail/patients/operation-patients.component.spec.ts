import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationPatientsComponent } from './operation-patients.component';

describe('OperationPatientsComponent', () => {
	let component: OperationPatientsComponent;
	let fixture: ComponentFixture<OperationPatientsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationPatientsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationPatientsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
