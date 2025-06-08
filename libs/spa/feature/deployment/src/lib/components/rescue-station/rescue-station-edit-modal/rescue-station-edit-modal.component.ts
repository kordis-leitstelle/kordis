import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Injectable,
	effect,
	inject,
	signal,
} from '@angular/core';
import {
	FormsModule,
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { map } from 'rxjs';

import {
	AlertGroup,
	Query,
	RescueStationDeployment,
	Unit,
} from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import {
	AlertGroupAssignmentFormGroup,
	alertGroupMinUnitsValidator,
	markInvalidFormControlsAsDirty,
} from '@kordis/spa/core/misc';
import {
	AlertGroupSelectionsComponent,
	PossibleAlertGroupSelectionsService,
	PossibleUnitSelectionsService,
	UnitSelectionOptionComponent,
	UnitsSelectionComponent,
} from '@kordis/spa/core/ui';
import {
	ProtocolCommunicationDetailsComponent,
	getProtocolPayloadIfFormValid,
	makeProtocolCommunicationDetailsForm,
} from '@kordis/spa/feature/protocol';

import { UNIT_FRAGMENT } from '../../deployment/deployments.query';
import { StrengthComponent } from './component/strength.component';
import {
	RescueStationData,
	RescueStationEditService,
} from './service/rescue-station-edit.service';
import { minStrengthValidator } from './validator/min-strength.validator';

@Injectable()
export class NonOperationUnitsSelectionService extends PossibleUnitSelectionsService {
	override filter = (unit: Unit): boolean =>
		unit.assignment?.__typename !== 'EntityOperationAssignment';
}

@Injectable()
export class NonOperationAlertGroupSelectionService extends PossibleAlertGroupSelectionsService {
	override filter = (alertGroup: AlertGroup): boolean =>
		alertGroup.assignment?.__typename !== 'EntityOperationAssignment';
}

@Component({
	selector: 'krd-rescue-station-edit-modal',
	imports: [
		AlertGroupSelectionsComponent,
		AsyncPipe,
		FormsModule,
		NzAlertComponent,
		NzButtonComponent,
		NzDividerComponent,
		NzFormModule,
		NzInputDirective,
		NzOptionComponent,
		NzSelectComponent,
		ProtocolCommunicationDetailsComponent,
		ReactiveFormsModule,
		StrengthComponent,
		UnitSelectionOptionComponent,
		UnitsSelectionComponent,
	],
	templateUrl: './rescue-station-edit-modal.component.html',
	styleUrl: './rescue-station-edit-modal.component.css',
	providers: [
		{
			provide: PossibleUnitSelectionsService,
			useClass: NonOperationUnitsSelectionService,
		},
		{
			provide: PossibleAlertGroupSelectionsService,
			useClass: NonOperationAlertGroupSelectionService,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RescueStationEditModalComponent {
	readonly rescueStation = signal<RescueStationDeployment | null>(null);
	readonly loadingState = signal<'UPDATE' | 'SIGN_OFF' | 'SIGN_IN' | false>(
		false,
	);

	readonly rescueStations$ = inject(GraphqlService)
		.queryOnce$<{
			rescueStationDeployments: Query['rescueStationDeployments'];
		}>(gql`
			${UNIT_FRAGMENT}
			query {
				rescueStationDeployments {
					id
					name
					signedIn
					strength {
						leaders
						subLeaders
						helpers
					}
					defaultUnits {
						...UnitData
					}
					assignments {
						__typename
						... on DeploymentUnit {
							unit {
								...UnitData
							}
						}
						... on DeploymentAlertGroup {
							alertGroup {
								id
								name
							}
							assignedUnits {
								unit {
									...UnitData
								}
							}
						}
					}
				}
			}
		`)
		.pipe(map(({ rescueStationDeployments }) => rescueStationDeployments));

	private readonly modal = inject(NzModalRef);
	private readonly fb = inject(NonNullableFormBuilder);
	readonly formGroup = this.fb.group({
		rescueStationData: this.fb.group({
			strength: this.fb.group(
				{
					leaders: this.fb.control(0, Validators.min(0)),
					subLeaders: this.fb.control(0, Validators.min(0)),
					helpers: this.fb.control(0, Validators.min(0)),
				},
				{
					validators: [minStrengthValidator],
				},
			),
			note: this.fb.control(''),
			units: this.fb.control<Unit[]>([]),
			alertGroups: this.fb.array<AlertGroupAssignmentFormGroup>(
				[],
				alertGroupMinUnitsValidator,
			),
		}),
		protocolData: makeProtocolCommunicationDetailsForm(this.fb),
	});

	private readonly rescueStationService = inject(RescueStationEditService);
	private readonly notificationService = inject(NzNotificationService);

	constructor() {
		effect(() => {
			if (this.rescueStation()) {
				this.formGroup.patchValue({
					rescueStationData: {
						/* eslint-disable @typescript-eslint/no-non-null-assertion */
						strength: this.rescueStation()!.strength,
						note: this.rescueStation()!.note,
						/* eslint-enable @typescript-eslint/no-non-null-assertion */
						units: this.getUnitsFromStation(),
					},
				});
				this.formGroup.controls.rescueStationData.setControl(
					'alertGroups',
					this.fb.array(
						this.getAlertGroupFormArrayFromStation(),
						alertGroupMinUnitsValidator,
					),
				);
			}
		});
	}

	updateSignedInStation(): void {
		markInvalidFormControlsAsDirty(this.formGroup.controls.rescueStationData);
		if (this.formGroup.controls.rescueStationData.invalid) {
			this.formGroup.controls.rescueStationData.markAllAsTouched();
			return;
		}
		this.loadingState.set('UPDATE');
		this.rescueStationService
			.update$(
				this.getRescueStationPayload(),
				getProtocolPayloadIfFormValid(this.formGroup.controls.protocolData),
			)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'RW Nachmeldung',
						`${this.rescueStation()?.name} wurde erfolgreich nachgemeldet.`,
					);
					this.modal.destroy();
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Die Rettungswache konnte aufgrund eines Fehlers nicht nachgemeldet werden.',
					),
			})
			.add(() => this.loadingState.set(false));
	}

	signInStation(): void {
		markInvalidFormControlsAsDirty(this.formGroup.controls.rescueStationData);
		if (this.formGroup.controls.rescueStationData.invalid) {
			this.formGroup.controls.rescueStationData.markAllAsTouched();
			return;
		}

		this.loadingState.set('SIGN_IN');
		this.rescueStationService
			.signIn$(
				this.getRescueStationPayload(),
				getProtocolPayloadIfFormValid(this.formGroup.controls.protocolData),
			)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'RW Anmeldung',
						`${this.rescueStation()?.name} wurde erfolgreich angemeldet.`,
					);
					this.modal.destroy();
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Die Rettungswache konnte aufgrund eines Fehlers nicht angemeldet werden.',
					),
			})
			.add(() => this.loadingState.set(false));
	}

	signOffStation(): void {
		markInvalidFormControlsAsDirty(this.formGroup.controls.rescueStationData);
		if (this.formGroup.controls.rescueStationData.invalid) {
			this.formGroup.controls.rescueStationData.markAllAsTouched();
			return;
		}

		this.loadingState.set('SIGN_OFF');
		this.rescueStationService
			.signOff$(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.rescueStation()!.id,
				getProtocolPayloadIfFormValid(this.formGroup.controls.protocolData),
			)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'RW Abmeldung',
						`${this.rescueStation()?.name} wurde erfolgreich abgemeldet.`,
					);
					this.modal.destroy();
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Die Rettungswache konnte aufgrund eines Fehlers nicht abgemeldet werden.',
					),
			})
			.add(() => this.loadingState.set(false));
	}

	private getUnitsFromStation(): Unit[] {
		let units: Unit[];
		// if the station is not signed in, we want to preselect the default units
		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		if (!this.rescueStation()!.signedIn) {
			units = this.rescueStation()!.defaultUnits;
		} else {
			units = this.rescueStation()!.assignments.reduce((acc, assignment) => {
				/* eslint-enable @typescript-eslint/no-non-null-assertion */
				if (assignment.__typename === 'DeploymentUnit') {
					acc.push(assignment.unit);
				}
				return acc;
			}, [] as Unit[]);
		}

		return units;
	}

	private getAlertGroupFormArrayFromStation(): AlertGroupAssignmentFormGroup[] {
		return this.rescueStation()!.assignments.reduce((acc, assignment) => {
			if (assignment.__typename === 'DeploymentAlertGroup') {
				acc.push(
					this.fb.group({
						alertGroup: this.fb.control(assignment.alertGroup),
						assignedUnits: this.fb.control(
							assignment.assignedUnits.map(({ unit }) => unit),
						),
					}),
				);
			}
			return acc;
		}, [] as AlertGroupAssignmentFormGroup[]);
	}

	private getRescueStationPayload(): RescueStationData {
		const rsData = this.formGroup.controls.rescueStationData.getRawValue();
		return {
			rescueStationId: this.rescueStation()!.id,
			strength: rsData.strength,
			note: rsData.note,
			assignedUnits: rsData.units,
			assignedAlertGroups: rsData.alertGroups,
		};
	}
}
