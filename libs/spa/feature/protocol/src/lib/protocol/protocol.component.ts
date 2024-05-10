import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ProtocolEntryTimePipe } from '../protocol-entry-time/protocol-entry-time.pipe';
import { UnitChipComponent } from '../unit-chip/unit-chip.component';
import { NzTableFullHeightDirective } from './nz-table-full-height.directive';
import { ProtocolEntry } from './protocol.model';

@Component({
	selector: 'krd-protocol',
	standalone: true,
	imports: [
		CommonModule,
		NzTableModule,
		NzToolTipModule,
		UnitChipComponent,
		NzTableFullHeightDirective,
		ProtocolEntryTimePipe,
	],
	templateUrl: './protocol.component.html',
	styleUrl: './protocol.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolComponent {
	public protocolEntries = input<ProtocolEntry[]>([]);
}
