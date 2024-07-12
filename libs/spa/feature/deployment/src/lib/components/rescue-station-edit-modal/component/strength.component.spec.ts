import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { StrengthComponent } from './strength.component';

describe('StrengthComponent', () => {
	let fixture: ComponentFixture<StrengthComponent>;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StrengthComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StrengthComponent);
	});

	it('should show correct total', async () => {
		fixture.componentRef.setInput(
			'formGroup',
			new FormGroup({
				leaders: new FormControl(1),
				subLeaders: new FormControl(2),
				helpers: new FormControl(3),
			}),
		);

		await fixture.autoDetectChanges();
		await fixture.whenStable();

		expect(fixture.nativeElement.textContent).toMatch(new RegExp(`6 $`));
	});
});
