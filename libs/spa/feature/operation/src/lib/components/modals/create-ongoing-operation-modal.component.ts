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
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { map } from 'rxjs';

import { Mutation, Query } from '@kordis/shared/model';
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
import { AlreadyInvolvedUnitsAlertComponent } from './already-involved-units-alert.component';
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

			<krd-already-involved-units-alert
				[unitsControl]="formGroup.controls.operation.controls.units"
				[alertGroupsControl]="formGroup.controls.operation.controls.alertGroups"
			/>

			<nz-divider nzPlain nzText="Alarmierung" />

			<nz-select
				nzMode="multiple"
				nzPlaceHolder="Alarmgruppen"
				formControlName="alertingIds"
				nzShowSearch
			>
				@for (alertGroup of alertGroups$ | async; track alertGroup.id) {
					<nz-option [nzLabel]="alertGroup.name" [nzValue]="alertGroup.id" />
				}
			</nz-select>

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
						@if (formGroup.controls.alertingIds.value.length > 0) {
							Einsatz mit Alarmierung erstellen
						} @else {
							Einsatz erstellen
						}
					</button>
				</div>
			</div>
		</form>
	`,
	styleUrl: './create-operation-modal.css',
	imports: [
		AlreadyInvolvedUnitsAlertComponent,
		AsyncPipe,
		CreateOperationFormComponent,
		FormsModule,
		NzButtonComponent,
		NzDividerComponent,
		NzFormModule,
		NzOptionComponent,
		NzSelectComponent,
		ProtocolCommunicationDetailsComponent,
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
		alertingIds: this.fb.control<string[]>([]),
	});
	readonly isLoading = signal(false);
	private readonly gqlService = inject(GraphqlService);
	readonly alertGroups$ = this.gqlService
		.queryOnce$<{
			alertGroups: Query['alertGroups'];
		}>(gql`
			query {
				alertGroups {
					id
					name
				}
			}
		`)
		.pipe(map(({ alertGroups }) => alertGroups));

	private readonly notificationService = inject(NzNotificationService);
	readonly #modal = inject(NzModalRef);

	constructor() {
		this.formGroup.controls.operation.controls.alertGroups.valueChanges.subscribe(
			(value) =>
				this.formGroup.controls.alertingIds.setValue(
					value.map(({ alertGroup }) => alertGroup?.id ?? ''),
				),
		);
	}

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
						$operation: CreateOngoingOperationArgs!
						$protocolMessage: BaseCreateMessageInput
						$alertData: OperationAlertArgs
					) {
						createOngoingOperation(
							operation: $operation
							protocolMessage: $protocolMessage
							alertData: $alertData
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
					alertData:
						this.formGroup.controls.alertingIds.value.length > 0
							? {
									alertGroupIds: this.formGroup.controls.alertingIds.value,
									hasPriority: true,
									description:
										this.formGroup.controls.operation.controls.description
											.value,
								}
							: null,
				},
			)
			.pipe(map((result) => result.createOngoingOperation))
			.subscribe({
				next: (operation) => {
					this.notificationService.success(
						'Einsatz erstellt',
						`Der Einsatz wurde mit der Einsatznummer ${operation.sign} erstellt.`,
					);
					this.#modal.destroy({
						operationId: operation.id,
					});
				},
				error: (err) =>
					this.notificationService.error(
						'Fehler',
						err.message || 'Ein unbekannter Fehler ist aufgetreten.',
					),
			})
			.add(() => this.isLoading.set(false));
	}
}
