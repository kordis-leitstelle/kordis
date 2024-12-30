import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { RescueStationNoteModalComponent } from './rescue-station-note-modal.component';

describe('RescueStationNoteModalComponent', () => {
	let fixture: ComponentFixture<RescueStationNoteModalComponent>;

	beforeEach(() => {
		fixture = TestBed.overrideProvider(NZ_MODAL_DATA, {
			useValue: { id: '1', name: 'Test Rescue Station' }, // ... provide the mock data
		})
			.overrideProvider(NzModalRef, {
				useValue: createMock(), // ... provide the mock data
			})
			.overrideProvider(GraphqlService, {
				useValue: createMock(),
			})
			.createComponent(RescueStationNoteModalComponent);
	});

	it('should create', () => {
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});
});
