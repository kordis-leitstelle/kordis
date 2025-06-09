import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import {
	FormsModule,
	NonNullableFormBuilder,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, combineLatest, map, startWith } from 'rxjs';

import { Mutation, Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import { markInvalidFormControlsAsDirty } from '@kordis/spa/core/misc';
import {
	PossibleAlertGroupSelectionsService,
	PossibleUnitSelectionsService,
} from '@kordis/spa/core/ui';
import {
	ProtocolCommunicationDetailsComponent,
	getProtocolPayloadIfFormValid,
	makeProtocolCommunicationDetailsForm,
} from '@kordis/spa/feature/protocol';

import {
	getOperationPayloadFromForm,
	makeCreateOperationForm,
} from '../../helper/create-operation-form.helper';
import { CreateOperationFormComponent } from './create-operation-form.component';

@Component({
	selector: 'krd-create-ongoing-operation-modal',
	template: `
		<form
			(ngSubmit)="createOngoingOperation()"
			[formGroup]="formGroup"
			nz-form
			nzLayout="vertical"
		>
			<nz-divider nzPlain nzText="Funkdaten" />

			<krd-protocol-communication-details
				[formGroup]="formGroup.controls.protocol"
				(recipientSet)="operationForm.focusLocation()"
			/>
			<nz-divider nzPlain nzText="Einsatzdaten" />

			<krd-create-operation-form
				#operationForm
				[formGroup]="formGroup.controls.operation"
			/>

			@let alreadyAssignedUnits =
				(alreadyOperationAssignedUnits$ | async) ?? [];
			@if (alreadyAssignedUnits.length > 0) {
				<ng-template #alreadyAssignedUnitsTmpl>
					Folgende Einheiten sind bereits einem Einsatz zugeordnet und werden
					rausgelöst:<br />
					<ul>
						@for (unit of alreadyAssignedUnits; track unit.id) {
							<li>
								{{ unit.callSign }} <small>{{ unit.name }}</small> -
								{{ $any(unit.assignment).operation.alarmKeyword }}
								{{ $any(unit.assignment).operation.sign }}
							</li>
						}
					</ul>
				</ng-template>

				<nz-alert nzType="warning" [nzMessage]="alreadyAssignedUnitsTmpl" />
			}

			<div nz-row>
				<div class="action-btns" nz-col nzSpan="24">
					<button
						[disabled]="isLoading()"
						[nzLoading]="isLoading()"
						nz-button
						nzDanger
						nzSize="large"
						type="submit"
					>
						Einsatz erstellen
					</button>
				</div>
			</div>
		</form>
	`,
	styleUrl: './create-operation-modal.css',
	imports: [
		AsyncPipe,
		NzAlertComponent,
		ProtocolCommunicationDetailsComponent,
		NzDividerComponent,
		CreateOperationFormComponent,
		NzButtonComponent,
		NzColDirective,
		FormsModule,
		NzFormModule,
		ReactiveFormsModule,
	],
	providers: [
		PossibleUnitSelectionsService,
		PossibleAlertGroupSelectionsService,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOngoingOperationModalComponent {
	private readonly fb = inject(NonNullableFormBuilder);
	readonly formGroup = this.fb.group({
		protocol: makeProtocolCommunicationDetailsForm(this.fb),
		operation: makeCreateOperationForm(this.fb, true),
	});
	readonly alreadyOperationAssignedUnits$: Observable<Unit[]> = combineLatest([
		this.formGroup.controls.operation.controls.units.valueChanges.pipe(
			map((units) =>
				units.filter(
					(unit) => unit.assignment?.__typename === 'EntityOperationAssignment',
				),
			),
			startWith([]),
		),
		this.formGroup.controls.operation.controls.alertGroups.valueChanges.pipe(
			map((alertGroups) =>
				alertGroups
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					.flatMap((group) => group.assignedUnits!)
					.filter(
						(unit) =>
							unit.assignment?.__typename === 'EntityOperationAssignment',
					),
			),
			startWith([]),
		),
	]).pipe(map(([units, alertGroupUnits]) => [...units, ...alertGroupUnits]));
	readonly isLoading = signal(false);

	private readonly gqlService = inject(GraphqlService);
	private readonly notificationService = inject(NzNotificationService);
	readonly #modal = inject(NzModalRef);

	createOngoingOperation(): void {
		markInvalidFormControlsAsDirty(this.formGroup.controls.operation);
		if (this.formGroup.controls.operation.invalid) {
			return;
		}

		this.gqlService
			.mutate$<{
				createOngoingOperation: Mutation['createOngoingOperation'];
			}>(
				gql`
					mutation CreateOngoingOperation(
						$operation: CreateOngoingOperationInput!
						$protocolMessage: BaseCreateMessageInput
					) {
						createOngoingOperation(
							operation: $operation
							protocolMessage: $protocolMessage
						) {
							id
							sign
						}
					}
				`,
				{
					operation: getOperationPayloadFromForm(
						this.formGroup.controls.operation,
					),
					protocolMessage: getProtocolPayloadIfFormValid(
						this.formGroup.controls.protocol,
					),
				},
			)
			.pipe(map((result) => result.createOngoingOperation))
			.subscribe({
				next: (operation) => {
					this.notificationService.success(
						'Einsatz erstellt',
						`Der Einsatz wurde mit der Einsatznummer ${operation.sign} erstellt.`,
						{ nzPlacement: 'topRight' },
					);
					this.#modal.destroy({
						operationId: operation.id,
					});
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Einsatz konnte nicht erstellt werden.',
					),
			})
			.add(() => this.isLoading.set(false));
	}
}
