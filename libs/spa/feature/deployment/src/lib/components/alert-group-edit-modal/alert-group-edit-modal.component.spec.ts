import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { AlertGroupEditModalComponent } from './alert-group-edit-modal.component';

describe('AlertGroupEditModalComponent', () => {
	let fixture: ComponentFixture<AlertGroupEditModalComponent>;

	beforeEach(() => {
		fixture = TestBed.overrideProvider(NzModalRef, {
			useValue: createMock<NzModalRef>(),
		})
			.overrideProvider(GraphqlService, {
				useValue: createMock<GraphqlService>(),
			})
			.createComponent(AlertGroupEditModalComponent);
	});

	it('should be defined', () => {
		expect(fixture.componentRef).toBeTruthy();
	});
});
