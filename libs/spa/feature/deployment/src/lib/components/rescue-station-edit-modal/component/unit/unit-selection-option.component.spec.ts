import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitSelectionOptionComponent } from './unit-selection-option.component';

describe('StrengthComponent', () => {
	let fixture: ComponentFixture<UnitSelectionOptionComponent>;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [UnitSelectionOptionComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(UnitSelectionOptionComponent);
	});

	it('should create', async () => {
		fixture.componentRef.setInput('unit', {
			id: 1,
			callSign: 'unit1',
			name: 'name',
		});
		fixture.detectChanges();

		expect(fixture.componentInstance).toBeTruthy();
	});
});
