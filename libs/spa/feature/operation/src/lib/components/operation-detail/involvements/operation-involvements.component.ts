import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
} from '@angular/core';
import { FormArray, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { NzEmptyComponent, NzEmptySimpleComponent } from 'ng-zorro-antd/empty';
import { map } from 'rxjs';

import {
	Operation,
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
	UpdateOperationUnitInvolvementInput,
} from '@kordis/shared/model';
import { gql } from '@kordis/spa/core/graphql';

import { dateInPastValidator } from '../../../validator/date-in-past.validator';
import { BaseOperationTabComponent } from '../base-operation-tab.component';
import {
	AlertGroupInvolvementFormGroup,
	OperationUAlertGroupInvolvementsFormComponent,
} from './form/alert-group/operation-alert-group-involvements-form.component';
import { UnitInvolvementFormGroup } from './form/unit/operation-unit-involvement-times.component';
import { OperationInvolvementsFormComponent } from './form/unit/operation-unit-involvements-form.component';
import {
	involvementTimeRangeValidator,
	involvementsTimeRangeValidator,
} from './involvements.validator';

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
		OperationInvolvementsFormComponent,
		OperationUAlertGroupInvolvementsFormComponent,
		NzEmptySimpleComponent,
		NzEmptyComponent,
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
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationInvolvementsComponent extends BaseOperationTabComponent {
	readonly involvementsFormGroup: FormGroup<{
		unitInvolvements: FormArray<UnitInvolvementFormGroup>;
		alertGroupInvolvements: FormArray<AlertGroupInvolvementFormGroup>;
	}>;

	constructor(
		private readonly fb: NonNullableFormBuilder,
		private readonly cd: ChangeDetectorRef,
	) {
		const _control = fb.group({
			unitInvolvements: fb.array<UnitInvolvementFormGroup>([]),
			alertGroupInvolvements: fb.array<AlertGroupInvolvementFormGroup>([]),
		});

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

		this.involvementsFormGroup = _control;
	}

	protected override setValue(operation: Operation): void {
		const start = new Date(operation.start);
		const end = operation.end ? new Date(operation.end) : null;
		this.involvementsFormGroup.setControl(
			'unitInvolvements',
			this.createUnitInvolvementsFormArray(
				operation.unitInvolvements,
				start,
				end,
			),
			{ emitEvent: false },
		);

		this.involvementsFormGroup.setControl(
			'alertGroupInvolvements',
			this.fb.array<AlertGroupInvolvementFormGroup>(
				operation.alertGroupInvolvements.map((alertGroupInvolvement) =>
					this.fb.group({
						alertGroup: this.fb.control(alertGroupInvolvement.alertGroup),
						unitInvolvements: this.createUnitInvolvementsFormArray(
							alertGroupInvolvement.unitInvolvements,
							operation.start,
							operation.end,
						),
					}),
				),
			),
			{ emitEvent: false },
		);

		this.cd.detectChanges();
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

	private createUnitInvolvementsFormArray(
		unitInvolvements: OperationUnitInvolvement[],
		minStart: Date,
		maxEnd: Date | null,
	): FormArray<UnitInvolvementFormGroup> {
		return this.fb.array<UnitInvolvementFormGroup>(
			unitInvolvements.map((unitInvolvement) =>
				this.createUnitInvolvementFormGroup(unitInvolvement, minStart, maxEnd),
			),
		);
	}

	private createUnitInvolvementFormGroup(
		unitInvolvement: OperationUnitInvolvement,
		minStart: Date,
		maxEnd: Date | null,
	): UnitInvolvementFormGroup {
		return this.fb.group({
			unit: this.fb.control(unitInvolvement.unit),
			isPending: this.fb.control(unitInvolvement.isPending),
			involvementTimes: this.fb.array(
				unitInvolvement.involvementTimes.map((time) =>
					this.fb.group(
						{
							start: this.fb.control(new Date(time.start)),
							end: this.fb.control(
								time.end ? new Date(time.end) : null,
								dateInPastValidator,
							),
						},
						{
							validators: involvementTimeRangeValidator(minStart, maxEnd),
						},
					),
				),
				{
					validators: involvementsTimeRangeValidator(minStart, maxEnd),
				},
			),
		});
	}
}
