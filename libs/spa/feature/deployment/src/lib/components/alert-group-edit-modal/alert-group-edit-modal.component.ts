import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { forkJoin } from 'rxjs';

import { Query, Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import { PossibleUnitSelectionsService } from '@kordis/spa/core/ui';
import { UnitsSelectComponent } from '@kordis/spa/core/ui';

import { AlertGroupAssignmentFormGroup } from '../rescue-station/rescue-station-edit-modal/rescue-station-edit-modal.component';
import { alertGroupMinUnitsValidator } from '../rescue-station/rescue-station-edit-modal/validator/alert-group-min-units.validator';

@Component({
	selector: 'krd-alert-group-edit-modal',
	imports: [
		NzButtonComponent,
		NzSpinComponent,
		NzTooltipDirective,
		UnitsSelectComponent,
	],
	template: `
		@if (loadingState() === 'INITIAL') {
			<nz-spin nzSize="large" />
		}

		@for (
			alertGroupControl of formArray.controls;
			track alertGroupControl.value.alertGroup!.id
		) {
			<span>{{ alertGroupControl.value.alertGroup!.name }}</span>
			<krd-units-select [control]="alertGroupControl.controls.assignedUnits" />
		}

		<div class="actions">
			<button
				nz-button
				nzSize="large"
				nzType="primary"
				[nzLoading]="loadingState() === 'UPDATE'"
				[disabled]="loadingState() !== null"
				(click)="updateAlertGroups()"
				nz-tooltip="Änderungen beeinflussen nicht aktuelle Zuordnungen, sondern lediglich die
			Standardeinheiten einer Alarmgruppe!"
			>
				Speichern
			</button>
		</div>
	`,
	providers: [PossibleUnitSelectionsService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		span {
			font-weight: 500;
		}

		.actions {
			margin-top: var(--base-spacing);
			display: flex;
			justify-content: flex-end;
		}
	`,
})
export class AlertGroupEditModalComponent {
	readonly loadingState = signal<'INITIAL' | 'UPDATE' | null>(null);
	readonly #modal = inject(NzModalRef);

	private readonly fb = inject(NonNullableFormBuilder);
	readonly formArray = this.fb.array<AlertGroupAssignmentFormGroup>(
		[],
		alertGroupMinUnitsValidator,
	);

	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
	);
	private readonly notificationService = inject(NzNotificationService);
	private readonly gql = inject(GraphqlService);

	constructor() {
		this.loadAlertGroups();
	}

	loadAlertGroups(): void {
		this.loadingState.set('INITIAL');
		this.gql
			.queryOnce$<{ alertGroups: Query['alertGroups'] }>(gql`
				fragment UnitData on Unit {
					id
					name
					callSign
					callSignAbbreviation
				}
				query GetAlertGroups {
					alertGroups {
						id
						name
						currentUnits {
							...UnitData
						}
					}
				}
			`)
			.subscribe(({ alertGroups }) => {
				for (const alertGroup of alertGroups) {
					alertGroup.currentUnits.forEach((unit) =>
						this.possibleUnitSelectionsService.markAsSelected(unit),
					);
					this.formArray.push(
						this.fb.group({
							alertGroup: this.fb.control(alertGroup),
							assignedUnits: this.fb.control(alertGroup.currentUnits),
						}),
					);
				}

				this.loadingState.set(null);
			});
	}

	updateAlertGroups(): void {
		this.loadingState.set('UPDATE');

		const updateOperations = this.formArray.controls
			.filter((alertGroupControl) => alertGroupControl.dirty)
			.map((alertGroupControl) =>
				this.gql.mutate$(
					gql`
						mutation UpdateCurrentAlertGroupUnits(
							$alertGroupId: ID!
							$unitIds: [ID!]!
						) {
							setCurrentAlertGroupUnits(
								alertGroupId: $alertGroupId
								unitIds: $unitIds
							) {
								id
								currentUnits {
									id
									name
									callSign
									callSignAbbreviation
								}
							}
						}
					`,
					{
						alertGroupId: alertGroupControl.value.alertGroup?.id,
						unitIds: alertGroupControl.value.assignedUnits?.map(
							(unit: Unit) => unit.id,
						),
					},
				),
			);

		if (updateOperations.length === 0) {
			this.loadingState.set(null);
			this.#modal.close();
			return;
		}

		forkJoin(updateOperations)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'Alarmgruppen aktualisiert',
						`Die Standardeinheiten der Alarmgruppen wurden aktualisiert.`,
					);
					this.#modal.close();
				},
				error: () =>
					this.notificationService.error(
						'Fehler beim Aktualisieren',
						`Die Standardeinheiten der Alarmgruppen konnten nicht aktualisiert werden.`,
					),
			})
			.add(() => this.loadingState.set(null));
	}
}
