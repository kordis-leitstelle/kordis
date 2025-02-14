import { DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { FormState } from '../../service/tabs-form-state.service';
import { FormStateIndicatorComponent } from './form-state-indicator.component';

describe('FormStateIndicatorComponent', () => {
	let component: FormStateIndicatorComponent;
	let fixture: ComponentFixture<FormStateIndicatorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				NzSpinComponent,
				NzIconDirective,
				NzTooltipDirective,
			],
			providers: [DatePipe],
		}).compileComponents();

		fixture = TestBed.createComponent(FormStateIndicatorComponent);
		component = fixture.componentInstance;
	});

	it('should display loading spinner when form state is LOADING', () => {
		fixture.componentRef.setInput('formState', {
			state: signal(FormState.LOADING),
		});
		fixture.detectChanges();
		const spinner = fixture.nativeElement.querySelector('nz-spin');
		expect(spinner).toBeTruthy();
	});

	it('should display warning icon with error message when form state is ERROR', () => {
		fixture.componentRef.setInput('formState', {
			latestSave: signal(new Date()),
			state: signal(FormState.ERROR),
			error: signal('Error message'),
		});
		fixture.detectChanges();
		const warningIcon = fixture.nativeElement.querySelector(
			'span[nzType="warning"]',
		);
		console.log(fixture.nativeElement.innerHTML);
		expect(warningIcon).toBeTruthy();
		expect(warningIcon.getAttribute('ng-reflect-directive-title')).toContain(
			'Error message',
		);
	});

	it('should display check-circle icon with latest save time when form state is SAVED', () => {
		fixture.componentRef.setInput('formState', {
			latestSave: signal(new Date('2021-09-01T12:00:00')),
			state: signal(FormState.SAVED),
		});
		fixture.detectChanges();
		const checkIcon = fixture.nativeElement.querySelector(
			'span[nzType="check-circle"]',
		);

		expect(checkIcon.getAttribute('ng-reflect-directive-title')).toContain(
			'Speicherstand: 01.09. 12:00',
		);
	});
});
