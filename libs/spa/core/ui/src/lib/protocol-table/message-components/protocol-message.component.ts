import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'krd-protocol-message',
	template: ` <b>{{ prefix() }}</b
		>: <ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolMessageComponent {
	readonly prefix = input.required<string>();
}
