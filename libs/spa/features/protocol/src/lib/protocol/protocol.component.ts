import { CommonModule, DatePipe } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ViewChild,
	inject,
} from '@angular/core';
import {
	NzCellFixedDirective,
	NzTableComponent,
	NzTableVirtualScrollDirective,
} from 'ng-zorro-antd/table';

import { DayChangeService } from './date-change.service';
import { ProtocolEntryTimePipe } from './protocol-entry-time.pipe';

@Component({
	imports: [
		CommonModule,
		NzTableComponent,
		NzTableVirtualScrollDirective,
		NzCellFixedDirective,
		ProtocolEntryTimePipe,
	],
	providers: [DatePipe],
	selector: 'krd-protocol',
	standalone: true,
	styleUrl: './protocol.component.css',
	templateUrl: './protocol.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolComponent implements AfterViewInit {
	readonly exampleData = [
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: null,
			entryType: 'UNIT_STATUS',
			payload: {
				old: 3,
				new: 4,
			},
			channel: 'D',
			producer: 'Tetra Control',
			searchableText:
				'Status 3 auf Status 4 geändert, Status in Anfahrt auf Status am Einsatzort.',
		},
		{
			id: '1',
			time: new Date(),
			sendingUnit: 'HH 12/42',
			receivingUnit: 'HH 10/0',
			entryType: 'RCS_COMMUNICATION',
			payload:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
			producer: 'Timon Masberg',
			channel: 'D',
			searchableText:
				'Lagemeldung: Eine Person im Wasser. Ein Rettungsschwimmer zu Menschenrettung vor. Genaue Einsatzstelle: Uwe',
		},
	];
	readonly dayChangeService = inject(DayChangeService);

	@ViewChild('protocolTable', { static: false })
	nzTableComponent?: NzTableComponent<[]>;

	/*ngAfterViewInit(): void {
this.nzTableComponent?.cdkVirtualScrollViewport?.scrolledIndexChange
		.pipe(
			pairwise(),
			filter(([oldIndex, newIndex]) => data > 0 && data % 54 === 0),
		)
		//.pipe(takeUntilDestroyed())
		.subscribe((data: number) => {
			console.log('scroll index to', data);
		});
	}*/

	trackById(_: number, data: unknown): string {
		return data.id;
	}
}
