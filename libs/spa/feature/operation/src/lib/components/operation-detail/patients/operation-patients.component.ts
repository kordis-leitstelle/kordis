import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import {
	MinusCircleOutline,
	PlusCircleOutline,
	PlusOutline,
} from '@ant-design/icons-angular/icons';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { markInvalidFormControlsAsDirty } from 'spa/core/misc';

import { Operation } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { BaseOperationTabComponent } from '../base-operation-tab.component';
import { OperationPatientDataFormComponent } from './operation-patient-data-form.component';

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
	imports: [
		CommonModule,
		NzTableModule,
		NzIconDirective,
		ReactiveFormsModule,
		NzButtonComponent,
		NzColDirective,
		NzDatePickerComponent,
		NzNoAnimationDirective,
		NzRowDirective,
		NzInputDirective,
		OperationPatientDataFormComponent,
	],
	templateUrl: `./operation-patients.component.html`,
	styles: `
		nz-table {
			.empty-result {
				text-align: center;
				padding: 10px;
			}

			.footer {
				display: flex;
				justify-content: flex-end;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationPatientsComponent extends BaseOperationTabComponent {
	readonly expandSet = new Set<number>();
	readonly formArray: FormArray<PatientFormGroup>;

	private readonly cd = inject(ChangeDetectorRef);

	constructor(
		private readonly fb: NonNullableFormBuilder,
		iconService: NzIconService,
	) {
		iconService.addIcon(PlusCircleOutline, MinusCircleOutline, PlusOutline);

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
			const fg = this.makePatientFormGroup();
			fg.setValue({
				address: {
					city: patient.address.city,
					street: patient.address.street,
					postalCode: patient.address.postalCode,
				},
				lastName: patient.lastName,
				firstName: patient.firstName,
				phoneNumber: patient.phoneNumber,
				whereabouts: patient.whereabouts,
				birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
			});
			this.formArray.push(fg, { emitEvent: false });
		}

		this.cd.detectChanges();
	}

	onExpandChange(id: number, checked: boolean): void {
		if (checked) {
			this.expandSet.add(id);
		} else {
			this.expandSet.delete(id);
		}
	}

	addPatient(): void {
		const fg = this.makePatientFormGroup();
		this.formArray.push(fg);
		markInvalidFormControlsAsDirty(fg); // initially show errors
		this.onExpandChange(this.formArray.length - 1, true);
	}

	removePatient(index: number): void {
		this.formArray.removeAt(index);
	}

	private makePatientFormGroup(): PatientFormGroup {
		return this.fb.group({
			firstName: this.fb.control(''),
			lastName: this.fb.control('', Validators.required),
			birthDate: this.fb.control<Date | null>(null),
			phoneNumber: this.fb.control(''),
			whereabouts: this.fb.control('', Validators.required),
			address: this.fb.group({
				street: this.fb.control(''),
				city: this.fb.control(''),
				postalCode: this.fb.control(''),
			}),
		});
	}
}
