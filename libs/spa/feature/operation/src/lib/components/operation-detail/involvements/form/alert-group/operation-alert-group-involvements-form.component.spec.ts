import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { createMock } from '@golevelup/ts-jest';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';

import { PossibleAlertGroupSelectionsService } from '@kordis/spa/core/ui';

import { OperationAlertGroupInvolvementsFormComponent } from './operation-alert-group-involvements-form.component';

describe('OperationAlertGroupInvolvementsFormComponent', () => {
	let component: OperationAlertGroupInvolvementsFormComponent;
	let fixture: ComponentFixture<OperationAlertGroupInvolvementsFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				NzCollapseModule,
				NzButtonComponent,
				NzIconDirective,
				NzPopoverDirective,
			],
			providers: [
				{
					provide: PossibleAlertGroupSelectionsService,
					useValue: createMock(),
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(
			OperationAlertGroupInvolvementsFormComponent,
		);
		component = fixture.componentInstance;
	});

	it('should be defined', () => {
		fixture.componentRef.setInput('formArray', new FormArray([]));
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});
});
