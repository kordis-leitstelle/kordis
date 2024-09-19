import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import {
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import {
	AlertGroup,
	RescueStationDeployment,
	Unit,
} from '@kordis/shared/model';

import { AlertGroupSelectionsComponent } from './component/alert-group/alert-group-selections.component';
import { ProtocolDataComponent } from './component/protocol-data.component';
import { StrengthComponent } from './component/strength.component';
import { UnitsSelectComponent } from './component/unit/units-select.component';
import { PossibleAlertGroupSelectionsService } from './service/alert-group-selection.service';
import {
	ProtocolMessageData,
	RescueStationData,
	RescueStationEditService,
} from './service/rescue-station-edit.service';
import { PossibleUnitSelectionsService } from './service/unit-selection.service';
import { alertGroupMinUnitsValidator } from './validator/alert-group-min-units.validator';
import { minStrengthValidator } from './validator/min-strength.validator';

export type AlertGroupAssignmentFormGroup = FormGroup<{
	alertGroup: FormControl<AlertGroup>;
	assignedUnits: FormControl<Unit[]>;
}>;

@Component({
	selector: 'krd-rescue-station-edit-modal',
	standalone: true,
	imports: [
		AlertGroupSelectionsComponent,
		NzAlertComponent,
		NzButtonComponent,
		NzCardComponent,
		NzFormModule,
		NzInputDirective,
		ProtocolDataComponent,
		ReactiveFormsModule,
		StrengthComponent,
		UnitsSelectComponent,
	],
	templateUrl: './rescue-station-edit-modal.component.html',
	styleUrl: './rescue-station-edit-modal.component.css',
	providers: [
		PossibleUnitSelectionsService,
		PossibleAlertGroupSelectionsService,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RescueStationEditModalComponent {
	readonly rescueStation: RescueStationDeployment = inject(NZ_MODAL_DATA);
	readonly loadingState = signal<'UPDATE' | 'SIGN_OFF' | 'SIGN_IN' | false>(
		false,
	);

	private readonly modal = inject(NzModalRef);
	private readonly fb = inject(NonNullableFormBuilder);
	readonly formGroup = this.fb.group({
		rescueStationData: this.fb.group({
			strength: this.fb.group(
				{
					leaders: this.fb.control(
						this.rescueStation.strength.leaders,
						Validators.min(0),
					),
					subLeaders: this.fb.control(
						this.rescueStation.strength.subLeaders,
						Validators.min(0),
					),
					helpers: this.fb.control(
						this.rescueStation.strength.helpers,
						Validators.min(0),
					),
				},
				{
					validators: [minStrengthValidator],
				},
			),
			note: this.fb.control(this.rescueStation.note),
			units: this.fb.control<Unit[]>(this.getInitialUnitsFromStation()),
			alertGroups: this.fb.array<AlertGroupAssignmentFormGroup>(
				this.getInitialAlertGroupsFromStation(),
				alertGroupMinUnitsValidator,
			),
		}),
		protocolData: this.fb.group({
			sender: this.fb.control<string | Unit>('', Validators.required),
			recipient: this.fb.control<string | Unit>('', Validators.required),
			channel: this.fb.control('', Validators.required),
		}),
	});

	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
	);
	private readonly possibleAlertGroupSelectionsService = inject(
		PossibleAlertGroupSelectionsService,
	);
	private readonly rescueStationService = inject(RescueStationEditService);
	private readonly notificationService = inject(NzNotificationService);

	updateSignedInStation(): void {
		if (!this.isFormValidForUpdate()) {
			return;
		}
		this.loadingState.set('UPDATE');
		this.rescueStationService
			.update$(
				this.getRescueStationPayload(),
				this.formGroup.controls.protocolData.dirty
					? this.getProtocolPayload()
					: undefined,
			)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'RW Nachmeldung',
						`${this.rescueStation.name} wurde erfolgreich nachgemeldet.`,
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
		this.formGroup.markAllAsTouched();
		this.formGroup.controls.protocolData.markAsDirty();
		if (this.formGroup.invalid) {
			return;
		}

		this.loadingState.set('SIGN_IN');
		this.rescueStationService
			.signIn$(this.getRescueStationPayload(), this.getProtocolPayload())
			.subscribe({
				next: () => {
					this.notificationService.success(
						'RW Anmeldung',
						`${this.rescueStation.name} wurde erfolgreich angemeldet.`,
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
		this.formGroup.controls.protocolData.markAllAsTouched();
		this.formGroup.controls.protocolData.markAsDirty();
		if (this.formGroup.controls.protocolData.invalid) {
			return;
		}

		this.loadingState.set('SIGN_OFF');
		this.rescueStationService
			.signOff$(this.rescueStation.id, this.getProtocolPayload())
			.subscribe({
				next: () => {
					this.notificationService.success(
						'RW Abmeldung',
						`${this.rescueStation.name} wurde erfolgreich abgemeldet.`,
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

	private getInitialUnitsFromStation(): Unit[] {
		let units: Unit[];
		// if the station is not signed in, we want to preselect the default units
		if (!this.rescueStation.signedIn) {
			units = this.rescueStation.defaultUnits;
		} else {
			units = this.rescueStation.assignments.reduce((acc, assignment) => {
				if (assignment.__typename === 'DeploymentUnit') {
					acc.push(assignment.unit);
				}
				return acc;
			}, [] as Unit[]);
		}
		return units;
	}

	private getInitialAlertGroupsFromStation(): AlertGroupAssignmentFormGroup[] {
		return this.rescueStation.assignments.reduce((acc, assignment) => {
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
			rescueStationId: this.rescueStation.id,
			strength: rsData.strength,
			note: rsData.note,
			assignedUnits: rsData.units,
			assignedAlertGroups: rsData.alertGroups,
		};
	}

	private getProtocolPayload(): ProtocolMessageData {
		const protocolData = this.formGroup.controls.protocolData.getRawValue();
		return {
			sender: protocolData.sender,
			recipient: protocolData.recipient,
			channel: protocolData.channel,
		};
	}

	/*
	 	If the protocol data is dirty, we want to make sure it is valid as it is an optional form
		first check if some fields are filled, if not, we mark the form as pristine to handle the case where a user enters a value, validates it, deletes it => should not be required
	 */
	private isFormValidForUpdate(): boolean {
		if (
			Object.values(this.formGroup.controls.protocolData.controls).every(
				(control) => control.value === null || control.value === '',
			)
		) {
			this.formGroup.controls.protocolData.markAsPristine();
		}

		return !(
			(this.formGroup.controls.protocolData.dirty &&
				this.formGroup.controls.protocolData.invalid) ||
			this.formGroup.controls.rescueStationData.invalid
		);
	}
}
