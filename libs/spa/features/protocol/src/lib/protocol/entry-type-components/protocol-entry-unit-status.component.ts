import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'krd-protocol-entry-unit-status',
	standalone: true,
	imports: [CommonModule],
	template: `
		<tr>
			<td>{{ entry.time }}</td>
			<td>{{ entry.sender }}</td>
			<td>{{ entry.receiver }}</td>
			<td>{{ entry.message }}</td>
			<td>{{ entry.channel }}</td>
			<td>{{ entry.user }}</td>
			<td></td>
		</tr>
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolEntryUnitStatusComponent {
	@Input() entry: unknown; // generic type of protocolentry<unitstatus>
}
