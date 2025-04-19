import {
	ChangeDetectionStrategy,
	Component,
	Signal,
	inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProtocolEntryUnion } from '@kordis/shared/model';
import { GraphqlService } from '@kordis/spa/core/graphql';
import { ProtocolTableComponent } from '@kordis/spa/core/ui';

import { ProtocolClient } from '../../services/protocol.client';
import { CreateProtocolMessageComponent } from '../create-protocol-message/create-protocol-message.component';

@Component({
	selector: 'krd-protocol-view',
	imports: [ProtocolTableComponent, CreateProtocolMessageComponent],
	providers: [ProtocolClient],
	template: `
		<krd-create-protocol-message class="create-form" />
		<krd-protocol-table
			[protocolEntries]="protocolEntries()"
			(reachedBottom)="loadMore()"
			class="table-view"
		/>
	`,
	styles: `
		:host {
			height: 100%;
			display: flex;
			flex-direction: column;
			gap: 8px;

			.table-view {
				flex-grow: 1;
				overflow-y: auto;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolViewComponent {
	protocolEntries: Signal<ProtocolEntryUnion[]>;
	private readonly client = inject(ProtocolClient);

	constructor(private readonly gqlService: GraphqlService) {
		this.protocolEntries = toSignal(this.client.protocolEntries$, {
			initialValue: [],
		});
	}

	loadMore(): void {
		this.client.loadNextPage();
	}
}
