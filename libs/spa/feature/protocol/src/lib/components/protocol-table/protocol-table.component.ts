import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	input,
	output,
	viewChild,
} from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ProtocolEntryUnion } from '@kordis/shared/model';

import { ProtocolEntryTimePipe } from '../protocol-entry-time/protocol-entry-time.pipe';
import { UnitChipComponent } from '../unit-chip/unit-chip.component';
import { NzTableFullHeightDirective } from './nz-table-full-height.directive';
import { RescueStationMessageComponent } from './rescue-station-message.component';

@Component({
	selector: 'krd-protocol-table',
	standalone: true,
	imports: [
		NzTableFullHeightDirective,
		NzTableModule,
		NzToolTipModule,
		ProtocolEntryTimePipe,
		UnitChipComponent,
		RescueStationMessageComponent,
	],
	templateUrl: './protocol-table.component.html',
	styleUrl: './protocol-table.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolTableComponent implements AfterViewInit {
	readonly protocolEntries = input.required<ProtocolEntryUnion[]>();
	readonly reachedBottom = output();

	private readonly sentinelEle = viewChild<ElementRef>('sentinel');

	ngAfterViewInit(): void {
		// the observer emits initially, thus, we skip the first one
		let initialSkip = false;
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && initialSkip) {
				this.reachedBottom.emit();
			} else {
				initialSkip = true;
			}
		});

		observer.observe(this.sentinelEle()?.nativeElement);
	}
}
