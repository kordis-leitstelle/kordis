import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzInputDirective } from 'ng-zorro-antd/input';

import { DateMaskInputComponent } from './date-mask-input.component';

describe('DateMaskInputComponent', () => {
	let fixture: ComponentFixture<DateMaskInputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FormsModule, DatePipe, NzInputDirective],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DateMaskInputComponent);
		fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should display the correct date format based on maskType', () => {
		fixture.componentRef.setInput('maskType', 'date');
		fixture.detectChanges();
		const inputElement: HTMLInputElement =
			fixture.nativeElement.querySelector('input');
		expect(inputElement.type).toBe('date');
	});
});
