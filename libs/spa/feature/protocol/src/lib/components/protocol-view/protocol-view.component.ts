import {
	ChangeDetectionStrategy,
	Component,
	Signal,
	inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProtocolEntryUnion, Unit } from '@kordis/shared/model';
import { ProtocolTableComponent } from '@kordis/spa/core/ui';

import { makeUnitInput } from '../../services/make-unit-input.helper';
import { ProtocolClient } from '../../services/protocol.client';
import { CreateProtocolMessageComponent } from '../create-protocol-message/create-protocol-message.component';

@Component({
	selector: 'krd-protocol-view',
	imports: [ProtocolTableComponent, CreateProtocolMessageComponent],
	providers: [ProtocolClient],
	template: `
		<krd-create-protocol-message
			class="create-form"
			(messageSubmit)="addMessage($event)"
		/>

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

			.table-view {
				flex-grow: 1;
				overflow-y: auto;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolViewComponent {
	private readonly client = inject(ProtocolClient);
	protocolEntries: Signal<ProtocolEntryUnion[]> = toSignal(
		this.client.protocolEntries$,
		{
			initialValue: [],
		},
	);

	loadMore(): void {
		this.client.loadNextPage();
	}

	addMessage(value: {
		sender: Unit | string;
		recipient: Unit | string;
		channel: string;
		message: string;
	}): void {
		this.client.addMessageAsync({
			sender: makeUnitInput(value.sender),
			recipient: makeUnitInput(value.recipient),
			channel: value.channel,
			message: value.message,
		});
	}
}
