import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';

describe('StrengthBadgeComponent', () => {
	let fixture: ComponentFixture<StatusBadgeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StatusBadgeComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(StatusBadgeComponent);
	});

	it('should show the status', () => {
		fixture.componentRef.setInput('status', 1);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('span').textContent).toEqual(
			'1',
		);
	});

	it('should show missing status', () => {
		fixture.componentRef.setInput('status', null);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('span').textContent).toEqual(
			'?',
		);
	});
});
