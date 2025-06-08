import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { RescueStationEditModalComponent } from './rescue-station-edit-modal.component';
import { RescueStationEditService } from './service/rescue-station-edit.service';

describe('RescueStationEditModalComponent', () => {
	beforeEach(() => {
		TestBed.overrideProvider(NzModalRef, {
			useValue: createMock<NzModalRef>(),
		})
			.overrideProvider(RescueStationEditService, {
				useValue: createMock<RescueStationEditService>(),
			})
			.overrideProvider(GraphqlService, {
				useValue: createMock<GraphqlService>(),
			})
			.configureTestingModule({
				imports: [NoopAnimationsModule],
			});
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(RescueStationEditModalComponent);
		const component = fixture.componentInstance;
		expect(component).toBeTruthy();
	});
});
