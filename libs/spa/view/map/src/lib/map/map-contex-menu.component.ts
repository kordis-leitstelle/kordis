import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
	NzMenuDirective,
	NzMenuItemComponent,
	NzSubMenuComponent,
} from 'ng-zorro-antd/menu';

import { GeoSearchService } from '@kordis/spa/core/geocoding';

import { MapStateService, MapStateType } from './map-state.service';
import { MapPopupComponent } from './popup/map-component-popup';

@Component({
	template: `
		<ul nz-menu>
			<li nz-submenu nzTitle="Neuer Einsatz">
				<ul>
					<li nz-menu-item>Nächste Adresse & Markerkoordinaten</li>
					<li nz-menu-item>Nächste Adresse & Adresskoordinaten</li>
					<li nz-menu-item>Markerkoordinaten</li>
				</ul>
			</li>
			<li nz-menu-item (click)="geoResult()">Geo-Informationen</li>
		</ul>
	`,
	styles: `
		.ant-menu-item,
		.ant-menu-submenu-title {
			margin: 0;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NzMenuDirective, NzSubMenuComponent, NzMenuItemComponent],
})
export class MapContextMenuComponent extends MapPopupComponent {
	private readonly mapState = inject(MapStateService);
	private readonly geoService = inject(GeoSearchService);

	geoResult(): void {
		this.geoService
			.addressFromCoords({
				lat: this.popup.getLngLat().lat,
				lon: this.popup.getLngLat().lng,
			})
			.subscribe((searchResult) => {
				this.mapState.state.set({
					type: MapStateType.GeoInformation,
					markerCoordinate: {
						lat: this.popup.getLngLat().lat,
						lon: this.popup.getLngLat().lng,
					},
					searchResult,
				});
			});
		this.popup.remove();
	}
}
