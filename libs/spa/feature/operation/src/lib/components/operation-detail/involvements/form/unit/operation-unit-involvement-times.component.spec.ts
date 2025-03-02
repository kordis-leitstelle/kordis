import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { InvolvementFormFactory } from '../../involvement-form.factory';
import { InvolvementOperationTimeState } from '../../involvement-operation-time.state';
import { OperationUnitInvolvementTimesComponent } from './operation-unit-involvement-times.component';

describe('OperationUnitInvolvementTimesComponent', () => {
	let fixture: ComponentFixture<OperationUnitInvolvementTimesComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [InvolvementFormFactory, InvolvementOperationTimeState],
		});
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OperationUnitInvolvementTimesComponent);
	});

	it('should remove an entry from the form array when the delete button is clicked', () => {
		fixture.componentRef.setInput(
			'formArray',
			new FormArray([
				new FormGroup({
					start: new FormControl(new Date()),
					end: new FormControl(new Date()),
				}),
			]),
		);
		fixture.detectChanges();
		expect(fixture.componentInstance.formArray().length).toBe(1);

		const deleteButton = fixture.debugElement.query(
			By.css("[data-testid='delete-involvement']"),
		);
		deleteButton.triggerEventHandler('click', null);

		fixture.detectChanges();

		expect(fixture.componentInstance.formArray.length).toBe(0);
	});
});
