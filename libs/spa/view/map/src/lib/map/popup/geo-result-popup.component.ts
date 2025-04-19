import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
	NzDescriptionsComponent,
	NzDescriptionsItemComponent,
} from 'ng-zorro-antd/descriptions';

import { GeoSearchResult } from '@kordis/spa/core/geocoding';

@Component({
	selector: 'krd-geo-result',
	template: `
		<nz-descriptions
			nzBordered
			nzSize="small"
			nzTitle="Geo-Informationen"
			nzLayout="vertical"
		>
			<nz-descriptions-item nzTitle="Nächstgelegende Adresse" nzSpan="4"
				>{{ searchResult().displayValue }}
			</nz-descriptions-item>
			<nz-descriptions-item nzTitle="Adresskoordinate" nzSpan="2"
				>{{ searchResult().coordinate.lat }},
				{{ searchResult().coordinate.lon }}
			</nz-descriptions-item>
			@if (
				markerCoordinate() &&
				markerCoordinate()!.lat !== searchResult().coordinate.lat &&
				markerCoordinate()!.lon !== searchResult().coordinate.lon
			) {
				<nz-descriptions-item nzTitle="Markierungskoordinate" nzSpan="2"
					>{{ markerCoordinate()!.lat }}, {{ markerCoordinate()!.lon }}
				</nz-descriptions-item>
			}
		</nz-descriptions>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NzDescriptionsComponent, NzDescriptionsItemComponent],
})
export class GeoResultPopupComponent {
	readonly markerCoordinate = input<{ lat: number; lon: number }>();
	readonly searchResult = input.required<GeoSearchResult>();
}
