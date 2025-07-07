import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { filter, first, map, tap, withLatestFrom } from 'rxjs';

import { AlertGroup, Operation, Query, Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import {
	AlertGroupAssignmentFormGroup,
	alertGroupMinUnitsValidator,
} from '@kordis/spa/core/misc';
import {
	AlertGroupSelectionsComponent,
	PossibleAlertGroupSelectionsService,
	PossibleUnitSelectionsService,
	UnitSelectionOptionComponent,
	UnitsSelectionComponent,
} from '@kordis/spa/core/ui';
import {
	ASSIGNMENT_QUERY_FIELDS,
	UNIT_FRAGMENT,
} from '@kordis/spa/feature/deployment';
import {
	ProtocolCommunicationDetailsComponent,
	getProtocolPayloadIfFormValid,
	makeProtocolCommunicationDetailsForm,
} from '@kordis/spa/feature/protocol';

import { OperationSelectComponent } from '../operation-select.component';
import { AlreadyInvolvedUnitsAlertComponent } from './already-involved-units-alert.component';

@Component({
	selector: 'krd-operation-involvements-modal',
	template: `
		<nz-divider nzPlain nzText="Funkdaten" />

		<krd-protocol-communication-details
			[formGroup]="protocolForm"
			(recipientSet)="operationSelect.focus()"
		/>

		<nz-divider nzPlain nzText="Einsatzdaten" />

		<div nz-form nzLayout="vertical">
			<div nz-row nzGutter="12">
				<div nz-col nzSpan="24">
					<nz-form-item>
						<nz-form-control
							nzErrorTip="Mindestens eine Alarmgruppe oder Einheit muss hinzugefügt werden!"
						>
							<krd-operation-select
								#operationSelect
								[operations]="(ongoingOperations$ | async) ?? []"
								[(selectedOperation)]="selectedOperation"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
			<div nz-row nzGutter="12">
				<div nz-col nzSpan="24">
					<nz-form-item>
						<nz-form-label>Einheiten</nz-form-label>
						<nz-form-control
							nzErrorTip="Mindestens eine Alarmgruppe oder Einheit muss hinzugefügt werden!"
						>
							<krd-units-select [control]="involvementsForm.controls.units">
								<ng-template let-unit>
									<krd-unit-selection-option [unit]="unit" />
								</ng-template>
							</krd-units-select>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>

			<div nz-row nzGutter="12">
				<div nz-col nzSpan="24">
					<nz-form-item>
						<nz-form-label>Alarmgruppen</nz-form-label>
						<nz-form-control>
							<krd-alert-group-selections
								[formArray]="involvementsForm.controls.alertGroups"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
		</div>

		<krd-already-involved-units-alert
			[unitsControl]="involvementsForm.controls.units"
			[alertGroupsControl]="involvementsForm.controls.alertGroups"
		/>

		<div class="action-btns">
			<button
				nz-button
				[disabled]="!selectedOperation()"
				(click)="changeInvolvements()"
			>
				Einheiten ändern
			</button>
		</div>
	`,
	styles: `
		.ant-divider-horizontal {
			margin: var(--base-spacing) 0;
		}

		.action-btns {
			margin-top: var(--base-spacing);
			display: flex;
			justify-content: end;
		}
	`,
	imports: [
		AlertGroupSelectionsComponent,
		AlreadyInvolvedUnitsAlertComponent,
		AsyncPipe,
		NzButtonComponent,
		NzDividerComponent,
		NzFormModule,
		OperationSelectComponent,
		ProtocolCommunicationDetailsComponent,
		UnitSelectionOptionComponent,
		UnitsSelectionComponent,
	],
	providers: [
		PossibleUnitSelectionsService,
		PossibleAlertGroupSelectionsService,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationInvolvementsModalComponent {
	readonly selectedOperation = signal<Operation | null>(null);
	private readonly fb = inject(NonNullableFormBuilder);
	readonly protocolForm = makeProtocolCommunicationDetailsForm(this.fb);
	readonly involvementsForm = this.fb.group({
		units: this.fb.control<Unit[]>([]),
		alertGroups: this.fb.array<AlertGroupAssignmentFormGroup>(
			[],
			alertGroupMinUnitsValidator,
		),
	});

	private readonly gqlService = inject(GraphqlService);
	private readonly notificationService = inject(NzNotificationService);
	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
	);
	private readonly possibleAlertGroupSelectionsService = inject(
		PossibleAlertGroupSelectionsService,
	);
	readonly #modal = inject(NzModalRef);

	readonly operationDeployments$ = this.gqlService
		.queryOnce$<{
			operationDeployments: Query['operationDeployments'];
		}>(
			gql`
			${UNIT_FRAGMENT}
			query {
				operationDeployments {
					operation {
						id
						sign
						alarmKeyword
						location {
							address {
								street
								city
								postalCode
								name
							}
						}
					}
					assignments {
						${ASSIGNMENT_QUERY_FIELDS}
					}
				}
			}
		`,
		)
		.pipe(map(({ operationDeployments }) => operationDeployments));
	readonly ongoingOperations$ = this.operationDeployments$.pipe(
		map((deployments) => deployments.map(({ operation }) => operation)),
	);

	constructor() {
		toObservable(this.selectedOperation)
			.pipe(
				tap(() => {
					this.possibleAlertGroupSelectionsService.resetSelections();
					this.possibleUnitSelectionsService.resetSelections();
				}),
				withLatestFrom(this.operationDeployments$),
				map(([operation, operationDeployments]) =>
					operationDeployments.find(
						(deployment) => deployment.operation.id === operation?.id,
					),
				),
				filter((op) => !!op),
				map((deployment) => {
					// assignments are presented in a joined array of units and alert groups, split them up
					const [units, alertGroups] = deployment.assignments.reduce(
						(acc, assignment) => {
							if (assignment.__typename === 'DeploymentUnit') {
								acc[0].push(assignment.unit);
							} else if (assignment.__typename === 'DeploymentAlertGroup') {
								acc[1].push({
									alertGroup: assignment.alertGroup,
									assignedUnits: assignment.assignedUnits.map(
										(unitInvolvement) => unitInvolvement.unit,
									),
								});
							}
							return acc;
						},
						[
							[] as Unit[],
							[] as {
								alertGroup: AlertGroup;
								assignedUnits: Unit[];
							}[],
						],
					);

					return {
						units,
						alertGroups,
					};
				}),
			)
			.subscribe(({ units, alertGroups }) => {
				this.involvementsForm.setControl(
					'alertGroups',
					this.fb.array<AlertGroupAssignmentFormGroup>(
						alertGroups.map(({ alertGroup, assignedUnits }) =>
							this.fb.group({
								alertGroup: this.fb.control(alertGroup),
								assignedUnits: this.fb.control(assignedUnits),
							}),
						) ?? [],
					),
				);

				this.involvementsForm.patchValue({
					units,
				});
			});

		// select first operation
		this.operationDeployments$.pipe(first()).subscribe((deployments) => {
			if (deployments.length > 0) {
				this.selectedOperation.set(deployments[0].operation);
			}
		});
	}

	changeInvolvements(): void {
		this.gqlService
			.mutate$(
				gql`
					mutation ChangeInvolvements(
						$operationId: ID!
						$protocol: BaseCreateMessageInput
						$assignedUnitIds: [String!]!
						$assignedAlertGroups: [AssignedAlertGroup!]!
					) {
						updateOngoingOperationInvolvements(
							operationId: $operationId
							involvements: {
								assignedUnitIds: $assignedUnitIds
								assignedAlertGroups: $assignedAlertGroups
							}
							protocolMessage: $protocol
						)
					}
				`,
				{
					operationId: this.selectedOperation()?.id,
					protocol: getProtocolPayloadIfFormValid(this.protocolForm),
					assignedUnitIds: this.involvementsForm.value.units?.map(
						(unit: Unit) => unit.id,
					),
					assignedAlertGroups: this.involvementsForm.value.alertGroups?.map(
						(alertGroup) => ({
							alertGroupId: alertGroup.alertGroup?.id,
							assignedUnitIds: alertGroup.assignedUnits?.map(
								(unit: Unit) => unit.id,
							),
						}),
					),
				},
			)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'Zuordnungen geändert',
						`Zuordnungen des Einsatzes ${this.selectedOperation()?.sign} wurde geändert.`,
					);
					this.#modal.close();
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Die Zuordnungen des Einsatzes konnten nicht geändert werden.',
					),
			});
	}
}
