import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { DeploymentsComponent } from './deployments.component';
import { DeploymentCardComponent } from './deplyoment-card.component';

describe('DeploymentsComponent', () => {
	let fixture: ComponentFixture<DeploymentsComponent>;

	beforeEach(async () => {
		TestBed.overrideProvider(GraphqlService, {
			useValue: createMock<GraphqlService>({
				query: jest.fn().mockReturnValue({
					$: of(),
				}),
			}),
		});
		TestBed.overrideProvider(NzModalService, {
			useValue: createMock<NzModalService>(),
		});
		TestBed.overrideComponent(DeploymentCardComponent, {
			set: {
				selector: 'krd-deployment-card',
				template: '<div></div>',
			},
		});

		fixture = TestBed.createComponent(DeploymentsComponent);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});
});
