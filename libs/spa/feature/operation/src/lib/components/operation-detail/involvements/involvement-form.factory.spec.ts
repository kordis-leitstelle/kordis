import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import {
	AlertGroup,
	Operation,
	OperationUnitInvolvement,
	Unit,
} from '@kordis/shared/model';

import { InvolvementFormFactory } from './involvement-form.factory';
import { InvolvementOperationTimeState } from './involvement-operation-time.state';

describe('InvolvementFormFactory', () => {
	let service: InvolvementFormFactory;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			providers: [InvolvementFormFactory, InvolvementOperationTimeState],
		});
		service = TestBed.inject(InvolvementFormFactory);
		TestBed.inject(InvolvementOperationTimeState).setOperationTime(
			new Date(),
			new Date(),
		);
	});

	it('should create an empty involvement form', () => {
		const form = service.createForm();
		expect(form).toBeTruthy();
		expect(form.get('unitInvolvements')).toBeTruthy();
		expect(form.get('alertGroupInvolvements')).toBeTruthy();
	});

	it('should create alert group involvements form array', () => {
		const operation: Operation = {
			alertGroupInvolvements: [
				{
					alertGroup: {} as AlertGroup,
					unitInvolvements: [] as OperationUnitInvolvement[],
				},
			],
			start: new Date().toISOString(),
			end: new Date().toISOString(),
		} as Operation;

		const formArray = service.createAlertGroupInvolvementsFormArray(operation);
		expect(formArray.length).toBe(1);
	});

	it('should create alert group involvement form group', () => {
		const alertGroup = {} as AlertGroup;
		const unitInvolvements = [
			{
				unit: {} as Unit,
				isPending: false,
				involvementTimes: [{ start: new Date(), end: new Date() }],
			},
		] as any;

		const formGroup = service.createAlertGroupInvolvementFormGroup(
			alertGroup,
			unitInvolvements,
		);
		expect(formGroup.get('alertGroup')).toBeTruthy();
		expect(formGroup.get('unitInvolvements')?.value).toEqual(unitInvolvements);
	});

	it('should create unit involvements form array', () => {
		const unitInvolvements: OperationUnitInvolvement[] = [];

		const formArray = service.createUnitInvolvementsFormArray(unitInvolvements);
		expect(formArray.length).toBe(0);
	});

	it('should create unit involvement form group', () => {
		const unitInvolvement = {
			unit: {} as Unit,
			isPending: false,
			involvementTimes: [{ start: new Date(), end: new Date() }],
		};

		const formGroup = service.createUnitInvolvementFormGroup(
			unitInvolvement as any,
		);
		expect(formGroup.get('unit')).toBeTruthy();
		expect(formGroup.get('isPending')?.value).toBe(unitInvolvement.isPending);
		expect(formGroup.get('involvementTimes')?.value).toEqual(
			unitInvolvement.involvementTimes,
		);
	});
});
