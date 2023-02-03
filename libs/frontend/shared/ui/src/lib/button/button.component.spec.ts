import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
	let component: ButtonComponent;
	let fixture: ComponentFixture<ButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ButtonComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ButtonComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should be disabled', () => {
		jest.spyOn(component.clicked, 'emit');

		const button: DebugElement = fixture.debugElement.query(By.css('button'));

		expect(button.nativeElement.disabled).toBeFalsy();

		component.isDisabled = true;
		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeTruthy();

		button.nativeElement.click();
		fixture.detectChanges();

		expect(component.clicked.emit).not.toHaveBeenCalled();
	});

	it('should show loading animation', () => {
		component.isLoading = true;
		fixture.detectChanges();

		const button: DebugElement = fixture.debugElement.query(By.css('button'));

		expect(button.children.length).toBe(1);
		expect(button.children[0].name).toBe('svg');
	});
});
