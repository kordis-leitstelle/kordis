import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { DeploymentUnitComponent } from './deployment-unit.component';

describe('DeploymentUnitComponent', () => {
	let fixture: ComponentFixture<DeploymentUnitComponent>;

	beforeEach(() => {
		TestBed.overrideProvider(GraphqlService, {
			useValue: createMock<GraphqlService>(),
		});
		fixture = TestBed.createComponent(DeploymentUnitComponent);
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
