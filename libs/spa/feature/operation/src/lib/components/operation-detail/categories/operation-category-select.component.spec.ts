import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationCategorySelectComponent } from './operation-category-select.component';

describe('OperationCategorySelectComponent', () => {
	let fixture: ComponentFixture<OperationCategorySelectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OperationCategorySelectComponent, NoopAnimationsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationCategorySelectComponent);
	});

	it('should create', async () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
