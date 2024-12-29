import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { DeploymentNotePopupComponent } from './deployment-note-popup.component';

describe('DeploymentNotePopupComponent', () => {
	let fixture: ComponentFixture<DeploymentNotePopupComponent>;

	beforeEach(() => {
		fixture = TestBed.overrideProvider(
			GraphqlService,
			createMock(),
		).createComponent(DeploymentNotePopupComponent);
	});

	it('should create', () => {
		fixture.componentRef.setInput('note', 'some note');
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should clear note', () => {
		fixture.componentRef.setInput('note', 'some note');
		fixture.detectChanges();
		fixture.nativeElement.querySelector('.reset-icon').click();
		fixture.detectChanges();
		expect(fixture.componentInstance.note()).toBe('');
	});
});
