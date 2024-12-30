import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';

import { AlertGroupSelectionComponent } from './alert-group-selection.component';

describe('AlertGroupSelectionComponent', () => {
	let component: AlertGroupSelectionComponent;
	let fixture: ComponentFixture<AlertGroupSelectionComponent>;

	beforeEach(async () => {
		TestBed.overrideComponent(AlertGroupSelectionComponent, {
			set: {
				selector: 'krd-units-select',
				template: 'unit selection',
			},
		});
		fixture = TestBed.createComponent(AlertGroupSelectionComponent);
	});

	it('should create', () => {
		fixture.componentRef.setInput(
			'formGroup',
			new FormGroup({
				alertGroup: new FormGroup({}),
				assignedUnits: new FormArray([]),
			}),
		);
		component = fixture.componentInstance;
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});
});
