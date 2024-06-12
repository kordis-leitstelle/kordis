import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ProtocolEntryUnion } from '@kordis/shared/model';

import { ProtocolEntryTimePipe } from '../protocol-entry-time/protocol-entry-time.pipe';
import { UnitChipComponent } from '../unit-chip/unit-chip.component';
import { NzTableFullHeightDirective } from './nz-table-full-height.directive';

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
// TODO: rename
export class ProtocolComponent {
	protocolEntries = input<ProtocolEntryUnion[]>([]);
}
