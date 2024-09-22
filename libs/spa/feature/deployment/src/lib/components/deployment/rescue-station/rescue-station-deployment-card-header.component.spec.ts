import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescueStationDeploymentCardHeaderComponent } from './rescue-station-deployment-card-header.component';

describe('RescueStationDeploymentCardHeaderComponent', () => {
	let fixture: ComponentFixture<RescueStationDeploymentCardHeaderComponent>;

	beforeEach(() => {
		fixture = TestBed.createComponent(
			RescueStationDeploymentCardHeaderComponent,
		);
	});

	it('should show note icon only if note is set', () => {
		fixture.componentRef.setInput('rescueStation', {
			strength: { leaders: 0, subLeaders: 0, helpers: 0 },
			note: '',
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('i')).toBeNull();

		fixture.componentRef.setInput('rescueStation', {
			strength: { leaders: 0, subLeaders: 0, helpers: 0 },
			note: 'some note',
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('i')).toBeTruthy();
	});

	it('should show correct strength', () => {
		fixture.componentRef.setInput('rescueStation', {
			strength: { leaders: 1, subLeaders: 2, helpers: 3 },
			note: '',
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('span').textContent).toEqual(
			'1/2/3//6',
		);
	});
});
