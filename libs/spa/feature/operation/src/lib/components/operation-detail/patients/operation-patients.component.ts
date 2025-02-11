import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
} from '@angular/forms';
import {
	DeleteOutline,
	MinusCircleOutline,
	PlusCircleOutline,
	PlusOutline,
} from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Operation } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { BaseOperationTabComponent } from '../base-operation-tab.component';
import { OperationPatientsTableComponent } from './operation-patients-table.component';

export type PatientFormGroup = FormGroup<{
	firstName: FormControl<string>;
	lastName: FormControl<string>;
	birthDate: FormControl<Date | null>;
	phoneNumber: FormControl<string>;
	whereabouts: FormControl<string>;
	address: FormGroup<{
		street: FormControl<string>;
		city: FormControl<string>;
		postalCode: FormControl<string>;
	}>;
}>;
const PATIENT_QUERY_FIELDS = `
	id
	patients {
		firstName
		lastName
		address {
			city
			street
			postalCode
		}
		birthDate
		phoneNumber
		whereabouts
	}`;

@Component({
	selector: 'krd-operation-patients',
	standalone: true,
	imports: [NzTableModule, OperationPatientsTableComponent],
	template: ` <krd-operation-patients-table [formArray]="formArray" />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationPatientsComponent extends BaseOperationTabComponent {
	readonly formArray: FormArray<PatientFormGroup>;

	constructor(
		private readonly fb: NonNullableFormBuilder,
		iconService: NzIconService,
	) {
		iconService.addIcon(
			PlusCircleOutline,
			MinusCircleOutline,
			DeleteOutline,
			PlusOutline,
		);

		const _control = fb.array<PatientFormGroup>([]);

		super(
			'patients',
			gql`
				query OperationUnitInvolvements($operationId: String!) {
					operation(id: $operationId) {
						${PATIENT_QUERY_FIELDS}
					}
				}
			`,
			gql`
				mutation UpdateOperationPatients(
					$operationId: String!
					$formValue: [OperationPatientInput!]!
				) {
					updateOperationBaseData(
						id: $operationId
						data: { patients: $formValue }
					) {
						${PATIENT_QUERY_FIELDS}
					}
				}
			`,
			_control,
		);

		this.formArray = _control;
	}

	protected override setValue(operation: Operation): void {
		this.formArray.clear({ emitEvent: false });
		for (const patient of operation.patients) {
			this.formArray.push(
				this.fb.group({
					address: this.fb.group({
						city: this.fb.control(patient.address.city),
						street: this.fb.control(patient.address.street),
						postalCode: this.fb.control(patient.address.postalCode),
					}),
					lastName: this.fb.control(patient.lastName),
					firstName: this.fb.control(patient.firstName),
					phoneNumber: this.fb.control(patient.phoneNumber),
					whereabouts: this.fb.control(patient.whereabouts),
					birthDate: this.fb.control(
						patient.birthDate ? new Date(patient.birthDate) : null,
					),
				}),
			);
		}
	}
}
