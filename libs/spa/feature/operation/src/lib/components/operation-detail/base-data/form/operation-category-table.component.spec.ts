import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationCategoryTableComponent } from './operation-category-table.component';

describe('OperationCategoryTableComponent', () => {
	let component: OperationCategoryTableComponent;
	let fixture: ComponentFixture<OperationCategoryTableComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				OperationCategoryTableComponent,
				HttpClientTestingModule,
				NoopAnimationsModule,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OperationCategoryTableComponent);
		fixture.componentRef.setInput('formArray', new FormArray([]));

		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should add new row', () => {
		fixture.debugElement
			.query(By.css('[data-testid="add-category"]'))
			.nativeElement.click();
		fixture.detectChanges();

		expect(component.formArray().length).toEqual(1);
	});

	it('should remove row', async () => {
		fixture.debugElement
			.query(By.css('[data-testid="add-category"]'))
			.nativeElement.click();
		fixture.detectChanges();

		fixture.debugElement
			.query(By.css('[data-testid="delete-category"]'))
			.nativeElement.click();
		fixture.detectChanges();

		expect(component.formArray().length).toEqual(0);
	});
});
