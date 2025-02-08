import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { distinctUntilChanged, filter, map } from 'rxjs';

import {
	AlertGroup,
	Operation,
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
	Unit,
	UpdateOperationUnitInvolvementInput,
} from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';
import {
	PossibleAlertGroupSelectionsService,
	PossibleUnitSelectionsService,
} from '@kordis/spa/core/ui';

import { BaseOperationTabComponent } from '../base-operation-tab.component';
import { OperationUAlertGroupInvolvementsFormComponent } from './form/alert-group/operation-alert-group-involvements-form.component';
import { OperationInvolvementsFormComponent } from './form/unit/operation-unit-involvements-form.component';
import {
	InvolvementFormFactory,
	InvolvementFormGroup,
} from './involvement-form.factory';

const INVOLVEMENT_FRAGMENT = gql`
	fragment OperationUnitInvolvements on Operation {
		id
		start
		end
		unitInvolvements {
			...UnitInvolvement
		}
		alertGroupInvolvements {
			alertGroup {
				id
				name
			}
			unitInvolvements {
				...UnitInvolvement
			}
		}
	}

	fragment UnitInvolvement on OperationUnitInvolvement {
		involvementTimes {
			start
			end
		}
		isPending
		unit {
			id
			callSign
			name
		}
	}
`;

@Component({
	selector: 'krd-operation-involvements',
	standalone: true,
	imports: [
		NzEmptyComponent,
		OperationInvolvementsFormComponent,
		OperationUAlertGroupInvolvementsFormComponent,
	],
	providers: [
		PossibleUnitSelectionsService,
		PossibleAlertGroupSelectionsService,
	],
	templateUrl: './operation-involvements.component.html',
	styles: `
		.empty {
			margin-top: 14px; /* from margin bottom of nz-empty */
			justify-content: center;

			nz-empty {
				.ant-empty-image {
					height: unset;
				}
			}
		}

		.container {
			display: grid;
			height: 100%;
			grid-template-rows: 1fr 1fr;
			gap: 16px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationInvolvementsComponent extends BaseOperationTabComponent<InvolvementFormGroup> {
	private currentOperationTime?: { start: Date; end: Date | null }; // keep track of operation time for involvement creation
	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
	);
	private readonly possibleAlertGroupSelectionsService = inject(
		PossibleAlertGroupSelectionsService,
	);
	private readonly cd = inject(ChangeDetectorRef);

	constructor(private readonly formFactory: InvolvementFormFactory) {
		const _control = formFactory.createForm();

		super(
			'involvements',
			gql`
				query OperationUnitInvolvements($operationId: String!) {
					operation(id: $operationId) {
						...OperationUnitInvolvements
					}
				}
				${INVOLVEMENT_FRAGMENT}
			`,
			gql`
				mutation UpdateOperationInvolvements(
					$operationId: String!
					$formValue: UpdateOperationInvolvementsInput!
				) {
					updateOperationInvolvements(
						id: $operationId
						involvements: $formValue
					) {
						...OperationUnitInvolvements
					}
				}
				${INVOLVEMENT_FRAGMENT}
			`,
			_control,
			map((formValue) => ({
				unitInvolvements: this.mapUnitInvolvementsToInput(
					formValue.unitInvolvements,
				),
				alertGroupInvolvements: formValue.alertGroupInvolvements.map(
					(alertGroupInvolvement: OperationAlertGroupInvolvement) => ({
						alertGroupId: alertGroupInvolvement.alertGroup.id,
						unitInvolvements: this.mapUnitInvolvementsToInput(
							alertGroupInvolvement.unitInvolvements,
						),
					}),
				),
			})),
		);

		this.recheckValidityOnChange();
	}

	addUnit(unit: Unit): void {
		this.pushUnitToControl(this.control.controls.unitInvolvements, unit);
		this.possibleUnitSelectionsService.markAsSelected(unit);
	}

	addUnitToAlertGroup(alertGroup: AlertGroup, unit: Unit): void {
		const alertGroupControl =
			this.control.controls.alertGroupInvolvements.controls.find(
				(v) => v.controls.alertGroup.value.id === alertGroup.id,
			);
		if (!alertGroupControl) {
			throw new Error('Alert group component not found');
		}
		this.pushUnitToControl(alertGroupControl.controls.unitInvolvements, unit);
	}

	addAlertGroup(alertGroup: AlertGroup): void {
		this.control.controls.alertGroupInvolvements.push(
			this.formFactory.createAlertGroupInvolvementFormGroup(
				alertGroup,
				[],
				/* eslint-disable @typescript-eslint/no-non-null-assertion */
				this.currentOperationTime!.start,
				this.currentOperationTime!.end,
				/* eslint-enable @typescript-eslint/no-non-null-assertion */
			),
		);
		this.possibleAlertGroupSelectionsService.markAsSelected(alertGroup);
	}

	protected override setValue(operation: Operation): void {
		this.markInvolvementsAsSelected(operation);

		const start = new Date(operation.start);
		const end = operation.end ? new Date(operation.end) : null;
		this.currentOperationTime = { start, end };

		this.control.setControl(
			'unitInvolvements',
			this.formFactory.createUnitInvolvementsFormArray(
				operation.unitInvolvements,
				start,
				end,
			),
			{ emitEvent: false },
		);

		this.control.setControl(
			'alertGroupInvolvements',
			this.formFactory.createAlertGroupInvolvementsFormArray(operation),
			{ emitEvent: false },
		);

		this.cd.markForCheck();
	}

	private pushUnitToControl(fa: FormArray, unit: Unit): void {
		fa.push(
			this.formFactory.createUnitInvolvementFormGroup(
				{
					unit: unit,
					isPending: false,
					involvementTimes: [
						/* eslint-disable @typescript-eslint/no-non-null-assertion */
						{
							start: this.currentOperationTime!.start,
							end: this.currentOperationTime!.end,
						},
					],
				},
				this.currentOperationTime!.start,
				this.currentOperationTime!.end,
				/* eslint-enable @typescript-eslint/no-non-null-assertion */
			),
		);
	}

	private markInvolvementsAsSelected(operation: Operation): void {
		this.possibleUnitSelectionsService.resetSelections();
		this.possibleAlertGroupSelectionsService.resetSelections();
		operation.unitInvolvements.forEach((unitInvolvement) =>
			this.possibleUnitSelectionsService.markAsSelected(unitInvolvement.unit),
		);
		operation.alertGroupInvolvements.forEach((alertGroupInvolvement) =>
			this.possibleAlertGroupSelectionsService.markAsSelected(
				alertGroupInvolvement.alertGroup,
			),
		);
	}

	private mapUnitInvolvementsToInput(
		unitInvolvements: OperationUnitInvolvement[],
	): UpdateOperationUnitInvolvementInput[] {
		return unitInvolvements.map((unitInvolvement) => ({
			unitId: unitInvolvement.unit.id,
			involvementTimes: unitInvolvement.involvementTimes,
			isPending: unitInvolvement.isPending,
		}));
	}

	private recheckValidityOnChange(): void {
		// as a change of a single involvement time can affect the validity of others, we naively trigger the validity of the whole form by marking all controls as touched
		// this.control.valueChanges.subscribe(() => this.control.markAllAsTouched());
		this.control.statusChanges
			.pipe(
				distinctUntilChanged(),
				filter((status) => status === 'INVALID'),
			)
			.subscribe(() => this.control.markAllAsTouched());
	}
}
