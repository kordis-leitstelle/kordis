import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
} from '@angular/core';
import {
	FormControl,
	FormGroup,
	FormsModule,
	NonNullableFormBuilder,
	Validators,
} from '@angular/forms';
import { debounce, map, pipe, timer } from 'rxjs';

import { Operation, OperationLocationInput } from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { getTopLevelDirtyValues } from '../../../helper/get-top-level-dirty-values.helper';
import { makeOperationLocationForm } from '../../../helper/operation-address-form.factory';
import { startBeforeEndValidator } from '../../../validator/start-before-end.validator';
import { BaseOperationTabComponent } from '../base-operation-tab.component';
import {
	OperationBaseDataForm,
	OperationBaseDataFormComponent,
	OperationBaseDataFormGroup,
} from './form/operation-base-data-form.component';

const OPERATION_BASE_DATA_FRAGMENT = gql`
	fragment OperationBaseData on Operation {
		id
		start
		end
		alarmKeyword
		reporter
		commander
		externalReference
		location {
			address {
				street
				postalCode
				city
				name
			}
			coordinate {
				lat
				lon
			}
		}
		categories {
			name
			count
			patientCount
			dangerousSituationCount
			wasDangerous
		}
	}
`;

const KEYS_TO_DEBOUNCE: ReadonlySet<keyof OperationBaseDataForm> = new Set<
	keyof OperationBaseDataForm
>(['reporter', 'commander', 'externalReference', 'location']);

@Component({
	selector: 'krd-operation-base-data',
	standalone: true,
	imports: [CommonModule, FormsModule, OperationBaseDataFormComponent],
	template: ` <krd-operation-base-data-form [formGroup]="formGroup" /> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationBaseDataComponent extends BaseOperationTabComponent {
	readonly formGroup: OperationBaseDataFormGroup;

	constructor(
		private readonly fb: NonNullableFormBuilder,
		private readonly cd: ChangeDetectorRef,
	) {
		const _formGroup = fb.group(
			{
				start: fb.control(new Date(), Validators.required),
				end: fb.control<Date | null>(null),
				alarmKeyword: fb.control(''),
				reporter: fb.control(''),
				commander: fb.control(''),
				externalReference: fb.control(''),
				location: makeOperationLocationForm(fb),
				categories: fb.array<
					FormGroup<{
						name: FormControl<string>;
						count: FormControl<number>;
						patientCount: FormControl<number>;
						dangerousSituationCount: FormControl<number>;
						wasDangerous: FormControl<boolean>;
					}>
				>([]),
			},
			{
				validators: [startBeforeEndValidator],
			},
		);

		super(
			'baseData',
			gql`
				query GetOperationBaseData($operationId: String!) {
					operation(id: $operationId) {
						...OperationBaseData
					}
				}
				${OPERATION_BASE_DATA_FRAGMENT}
			`,
			gql`
				mutation UpdateOperationBaseData(
					$operationId: String!
					$formValue: UpdateOperationBaseDataInput!
				) {
					updateOperationBaseData(id: $operationId, data: $formValue) {
						...OperationBaseData
					}
				}
				${OPERATION_BASE_DATA_FRAGMENT}
			`,
			_formGroup,
			pipe(
				map(() => getTopLevelDirtyValues(_formGroup)),
				debounce((v) =>
					// if the form has dirty values that are string values, we want to debounce them
					Object.keys(v).some((k) =>
						KEYS_TO_DEBOUNCE.has(k as keyof OperationBaseDataForm),
					)
						? timer(500)
						: timer(0),
				),
				map((op) => {
					// as we cannot set formgroups null, we have to check if any value of the coordinate is null and then set the whole input value null
					if (
						op.location &&
						(op.location.coordinate?.lat == null ||
							op.location?.coordinate?.lon == null)
					) {
						(op.location as OperationLocationInput).coordinate = null;
					}

					return op;
				}),
			),
		);

		this.formGroup = _formGroup;
	}

	protected override setValue(operation: Operation): void {
		this.setOperationBaseData(operation);
		this.setOperationCategories(operation.categories);

		this.cd.detectChanges();
	}

	private setOperationBaseData(operation: Operation): void {
		this.formGroup.patchValue(
			{
				location: {
					address: {
						name: operation.location.address.name,
						street: operation.location.address.street,
						postalCode: operation.location.address.postalCode,
						city: operation.location.address.city,
					},
					coordinate: operation.location.coordinate
						? {
								lat: operation.location.coordinate.lat,
								lon: operation.location.coordinate.lon,
							}
						: {
								lat: null,
								lon: null,
							},
				},
				alarmKeyword: operation.alarmKeyword,
				reporter: operation.reporter,
				commander: operation.commander,
				externalReference: operation.externalReference,
				start: new Date(operation.start),
				end: operation.end ? new Date(operation.end) : null,
			},
			{ emitEvent: false },
		);

		// operations that are currently ongoing have to be ended via the end operation procedure
		if (!operation.end) {
			this.formGroup.controls.end.disable({ emitEvent: false });
		} else {
			this.formGroup.controls.end.enable({ emitEvent: false });
		}
	}

	private setOperationCategories(categories: Operation['categories']): void {
		this.formGroup.setControl(
			'categories',
			this.fb.array(
				categories.map((category) =>
					this.fb.group({
						name: this.fb.control(category.name),
						count: this.fb.control(category.count),
						patientCount: this.fb.control(category.patientCount),
						dangerousSituationCount: this.fb.control(
							category.dangerousSituationCount,
						),
						wasDangerous: this.fb.control(category.wasDangerous),
					}),
				),
			),
			{ emitEvent: false },
		);
	}
}
