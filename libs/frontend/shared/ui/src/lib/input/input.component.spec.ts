import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputComponent } from './input.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('InputComponent', () => {
	let component: InputComponent;
	let fixture: ComponentFixture<InputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [InputComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(InputComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should be disabled', async () => {
		const input: DebugElement = fixture.debugElement.query(By.css('input'));

		expect(input.nativeElement.disabled).toBeFalsy();

		component.isDisabled = true;
		fixture.detectChanges();
		await fixture.whenStable();

		expect(input.nativeElement.disabled).toBeTruthy();
	});

	it('should have error state', () => {
		const input: DebugElement = fixture.debugElement.query(By.css('input'));
		expect(input.classes['input-error']).toBeFalsy();

		component.hasError = true;
		fixture.detectChanges();

		expect(input.classes['input-error']).toBeTruthy();
	});

	it('should have error text', () => {
		const input: DebugElement = fixture.debugElement.query(By.css('input'));
		expect(input.classes['input-error']).toBeFalsy();
		const errorText = 'foo bar test';

		component.hasError = true;
		component.errorText = errorText;
		fixture.detectChanges();

		const errorParagraph = fixture.debugElement.query(By.css('p.text-red-600'));
		expect(errorParagraph.nativeElement.innerHTML).toContain(errorText);
	});
});
