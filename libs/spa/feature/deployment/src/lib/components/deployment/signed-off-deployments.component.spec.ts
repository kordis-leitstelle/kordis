import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { NzModalService } from 'ng-zorro-antd/modal';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { SignedOffDeploymentsComponent } from './signed-off-deployments.component';

describe('SignedOffDeploymentsComponent', () => {
	let fixture: ComponentFixture<SignedOffDeploymentsComponent>;

	beforeEach(async () => {
		fixture = TestBed.overrideProvider(DeploymentsSearchStateService, {
			useValue: createMock(),
		})
			.overrideProvider(NzModalService, {
				useValue: createMock(),
			})
			.createComponent(SignedOffDeploymentsComponent);
	});

	it('should show no search results if no rescue stations provided', () => {
		fixture.componentRef.setInput('rescueStations', []);
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('.empty-state').textContent,
		).toContain('Keine abgemeldeten Rettungswachen gefunden');
	});
});
