import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { operation } from 'retry';
import { map } from 'rxjs';

import { Operation, Query } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import {
	ProtocolCommunicationDetailsComponent,
	getProtocolPayloadFromForm,
	makeProtocolCommunicationDetailsForm,
} from '@kordis/spa/feature/protocol';

import { OperationSelectComponent } from '../operation-select.component';

@Component({
	selector: 'krd-end-operation-modal',
	template: `
		<nz-divider nzPlain nzText="Funkdaten" />

		<krd-protocol-communication-details
			[formGroup]="protocolForm"
			(recipientTab)="operationSelect.focus()"
		/>

		<nz-divider nzPlain nzText="Einsatzdaten" />

		<krd-operation-select
			#operationSelect
			[operations]="(ongoingOperations$ | async) ?? []"
			[(selectedOperation)]="selectedOperation"
		/>
		<div class="action-btns">
			<button
				nz-button
				[disabled]="!selectedOperation()"
				(click)="endOperation()"
			>
				Einsatz beenden
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
		OperationSelectComponent,
		AsyncPipe,
		NzButtonComponent,
		ProtocolCommunicationDetailsComponent,
		NzDividerComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndOperationModalComponent {
	readonly selectedOperation = signal<Operation | null>(null);
	readonly protocolForm = makeProtocolCommunicationDetailsForm(
		inject(NonNullableFormBuilder),
	);
	private readonly gqlService = inject(GraphqlService);
	private readonly notificationService = inject(NzNotificationService);
	readonly #modal = inject(NzModalRef);
	readonly ongoingOperations$ = this.gqlService
		.queryOnce$<{
			operations: Query['operations'];
		}>(gql`
			query {
				operations(filter: { processStates: [ACTIVE] }) {
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
			}
		`)
		.pipe(map(({ operations }) => operations));

	endOperation(): void {
		this.gqlService
			.mutate$(
				gql`
					mutation EndOngoingOperation(
						$operationId: ID!
						$protocol: BaseCreateMessageInput
					) {
						endOngoingOperation(
							operationId: $operationId
							protocolMessage: $protocol
						)
					}
				`,
				{
					operationId: this.selectedOperation()?.id,
					protocol: this.protocolForm.valid
						? getProtocolPayloadFromForm(this.protocolForm)
						: null,
				},
			)
			.subscribe({
				next: () => {
					this.notificationService.success(
						'Einsatz beendet',
						`Der Einsatz ${this.selectedOperation()?.sign} wurde beendet.`,
					);
					this.#modal.close();
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Der Einsatz konnte nicht beendet werden.',
					),
			});
	}

	protected readonly operation = operation;
}
