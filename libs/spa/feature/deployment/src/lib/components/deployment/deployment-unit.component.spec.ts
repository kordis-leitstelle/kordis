import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DeploymentUnitComponent } from './deployment-unit.component';

describe('DeploymentUnitComponent', () => {
	let fixture: ComponentFixture<DeploymentUnitComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DeploymentUnitComponent, NoopAnimationsModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DeploymentUnitComponent);
	});

	it('should be defined', () => {
		fixture.componentRef.setInput('unit', {
			id: '1',
			callSign: 'Alpha',
			name: 'Unit Alpha',
			status: { status: 1 },
		});
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeDefined();
	});

	it('should show a note if the unit has a note', () => {
		fixture.componentRef.setInput('unit', {
			id: '1',
			callSign: 'Alpha',
			name: 'Unit Alpha',
			note: 'This is a note',
			status: { status: 1 },
		});
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('i')).toBeTruthy();
	});
});
