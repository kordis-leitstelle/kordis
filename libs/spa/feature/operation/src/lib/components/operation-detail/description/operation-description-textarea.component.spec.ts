import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationDescriptionComponent } from './operation-description-textarea.component';

describe('OperationDescriptionTextareaComponent', () => {
	let fixture: ComponentFixture<OperationDescriptionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationDescriptionComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationDescriptionComponent);
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
