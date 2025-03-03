import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';

import { Query } from '@kordis/shared/model';
import {
	GraphqlService,
	PROTOCOL_ENTRY_FRAGMENTS,
	PROTOCOL_ENTRY_FRAGMENTS_FIELDS,
	gql,
} from '@kordis/spa/core/graphql';
import { ProtocolTableComponent } from '@kordis/spa/core/ui';

import { SelectedOperationIdStateService } from '../../../service/selected-operation-id-state.service';

@Component({
	selector: 'krd-operation-protocol',
	imports: [ProtocolTableComponent, AsyncPipe],
	template: ` <krd-protocol-table
		[protocolEntries]="(entries$ | async) ?? []"
	/>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationProtocolComponent {
	private readonly selectedOperationIdState = inject(
		SelectedOperationIdStateService,
	);
	readonly entries$ = inject(GraphqlService)
		.queryOnce$<{ operation: Query['operation'] }>(
			gql`
			${PROTOCOL_ENTRY_FRAGMENTS}
			query Operation($id: ID!) {
				operation(id: $id) {
					protocol {
						${PROTOCOL_ENTRY_FRAGMENTS_FIELDS}
					}
				}
			}
		`,
			{
				id: this.selectedOperationIdState.selectedOperationId(),
			},
		)
		.pipe(map((result) => result.operation.protocol));
}
