import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { DeploymentUnitDetailsComponent } from './deployment-unit-details.component';

describe('DeploymentUnitDetailsComponent', () => {
	let fixture: ComponentFixture<DeploymentUnitDetailsComponent>;

	beforeEach(() => {
		TestBed.overrideProvider(GraphqlService, {
			useValue: createMock<GraphqlService>(),
		});
		fixture = TestBed.createComponent(DeploymentUnitDetailsComponent);
		fixture.componentRef.setInput('unit', {
			id: '1',
			callSign: 'Alpha',
			name: 'Unit Alpha',
			status: { status: 1 },
			note: 'Initial note',
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
