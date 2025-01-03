import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOperationModalComponent } from './create-operation-modal.component';

describe('CreateOperationModalComponent', () => {
	let component: CreateOperationModalComponent;
	let fixture: ComponentFixture<CreateOperationModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CreateOperationModalComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateOperationModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
