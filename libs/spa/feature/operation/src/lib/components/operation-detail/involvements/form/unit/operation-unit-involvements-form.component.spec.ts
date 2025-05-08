import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock } from '@golevelup/ts-jest';

import { PossibleUnitSelectionsService } from '@kordis/spa/core/ui';

import { InvolvementFormFactory } from '../../involvement-form.factory';
import { InvolvementOperationTimeState } from '../../involvement-operation-time.state';
import { OperationInvolvementsFormComponent } from './operation-unit-involvements-form.component';

describe('OperationInvolvementsFormComponent', () => {
	let fixture: ComponentFixture<OperationInvolvementsFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NoopAnimationsModule],
			providers: [
				InvolvementFormFactory,
				InvolvementOperationTimeState,
				{
					provide: PossibleUnitSelectionsService,
					useValue: createMock(),
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OperationInvolvementsFormComponent);
	});

	it('should not remove an involvement if it has no involvement times and is pending', () => {
		fixture.componentRef.setInput(
			'formArray',
			new FormArray([
				new FormGroup({
					unit: new FormControl({
						id: '123',
					}),
					isPending: new FormControl(true),
					involvementTimes: new FormArray([
						new FormGroup({
							start: new FormControl(new Date()),
							end: new FormControl(null),
						}),
					]),
				}),
				new FormGroup({
					unit: new FormControl({
						id: '456',
					}),
					isPending: new FormControl(false),
					involvementTimes: new FormArray([
						new FormGroup({
							start: new FormControl(new Date()),
							end: new FormControl(null),
						}),
					]),
				}),
			]),
		);

		fixture.detectChanges();

		expect(fixture.componentInstance.formArray().length).toBe(2);

		fixture.componentInstance
			.formArray()
			.at(0)
			.controls.involvementTimes.removeAt(0);

		fixture.detectChanges();

		expect(fixture.componentInstance.formArray().length).toBe(2);
	});
});
