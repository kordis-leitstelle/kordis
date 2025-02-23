import { TestBed } from '@angular/core/testing';
import { FormsModule, NonNullableFormBuilder } from '@angular/forms';

import {
	AlertGroup,
	Operation,
	OperationUnitInvolvement,
	Unit,
} from '@kordis/shared/model';

import { InvolvementFormFactory } from './involvement-form.factory';

describe('InvolvementFormFactory', () => {
	let service: InvolvementFormFactory;
	let fb: NonNullableFormBuilder;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			providers: [InvolvementFormFactory],
		});
		service = TestBed.inject(InvolvementFormFactory);
		fb = TestBed.inject(NonNullableFormBuilder);
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
			start: new Date(),
			end: new Date(),
		} as Operation;

		const formArray = service.createAlertGroupInvolvementsFormArray(operation);
		expect(formArray.length).toBe(1);
	});

	it('should create alert group involvement form group', () => {
		const alertGroup = {} as AlertGroup;
		const unitInvolvements: OperationUnitInvolvement[] = [
			{
				unit: {} as Unit,
				isPending: false,
				involvementTimes: [{ start: new Date(), end: new Date() }],
			},
		];
		const minStart = new Date();
		const maxEnd = new Date();

		const formGroup = service.createAlertGroupInvolvementFormGroup(
			alertGroup,
			unitInvolvements,
			minStart,
			maxEnd,
		);
		expect(formGroup.get('alertGroup')).toBeTruthy();
		expect(formGroup.get('unitInvolvements')?.value).toEqual(unitInvolvements);
	});

	it('should create unit involvements form array', () => {
		const unitInvolvements: OperationUnitInvolvement[] = [];
		const minStart = new Date();
		const maxEnd = new Date();

		const formArray = service.createUnitInvolvementsFormArray(
			unitInvolvements,
			minStart,
			maxEnd,
		);
		expect(formArray.length).toBe(0);
	});

	it('should create unit involvement form group', () => {
		const unitInvolvement: OperationUnitInvolvement = {
			unit: {},
			isPending: false,
			involvementTimes: [{ start: new Date(), end: new Date() }],
		} as OperationUnitInvolvement;
		const minStart = new Date();
		const maxEnd = new Date();

		const formGroup = service.createUnitInvolvementFormGroup(
			unitInvolvement,
			minStart,
			maxEnd,
		);
		expect(formGroup.get('unit')).toBeTruthy();
		expect(formGroup.get('isPending')?.value).toBe(unitInvolvement.isPending);
		expect(formGroup.get('involvementTimes')?.value).toEqual(
			unitInvolvement.involvementTimes,
		);
	});
});
