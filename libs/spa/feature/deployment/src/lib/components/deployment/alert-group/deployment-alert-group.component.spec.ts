import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentAlertGroupComponent } from './deployment-alert-group.component';

describe('DeploymentAlertGroupComponent', () => {
	let fixture: ComponentFixture<DeploymentAlertGroupComponent>;

	beforeEach(() => {
		fixture = TestBed.createComponent(DeploymentAlertGroupComponent);
	});

	it('should show no assignment not on no unit assignments', () => {
		fixture.componentRef.setInput('alertGroup', { name: 'test' });
		fixture.componentRef.setInput('unitAssignments', []);
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('[data-testid="no-unit-assignments"]')
				.textContent,
		).toBe('Keine Zuordnungen');
	});
});
