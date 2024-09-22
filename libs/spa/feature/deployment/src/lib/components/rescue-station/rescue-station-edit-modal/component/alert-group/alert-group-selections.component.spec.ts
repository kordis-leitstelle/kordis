import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { createMock } from '@golevelup/ts-jest';

import { PossibleAlertGroupSelectionsService } from '../../service/alert-group-selection.service';
import { AlertGroupSelectionsComponent } from './alert-group-selections.component';

describe('AlertGroupSelectionsComponent', () => {
	let fixture: ComponentFixture<AlertGroupSelectionsComponent>;

	beforeEach(async () => {
		TestBed.overrideProvider(PossibleAlertGroupSelectionsService, {
			useValue: createMock<PossibleAlertGroupSelectionsService>(),
		});
		fixture = TestBed.createComponent(AlertGroupSelectionsComponent);
	});

	it('should create', () => {
		fixture.componentRef.setInput('formArray', new FormArray([]));
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});
});
