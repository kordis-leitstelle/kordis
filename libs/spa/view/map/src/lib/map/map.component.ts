import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { Map } from 'maplibre-gl';

import {
	GeoSearchComponent,
	GeoSearchResult,
} from '@kordis/spa/core/geocoding';

@Component({
	selector: 'krd-map',
	imports: [CommonModule, GeoSearchComponent],
	templateUrl: './map.component.html',
	styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit {
	map!: Map;

	ngAfterViewInit(): void {
		this.map = new Map({
			container: 'map',
			style:
				'https://gist.githubusercontent.com/timonmasberg/0d3e333d62bb46d6b2a50e6808250218/raw/6232c77bd56984ea237e62a7e591aecf932e7b10/osm.json', // stylesheet location
			center: [-74.5, 40], // starting position [lng, lat]
			zoom: 9, // starting zoom
		});
	}

	onGeoResultSelected(result: GeoSearchResult): void {
		this.map.flyTo({
			center: [result.coordinate.lon, result.coordinate.lat],
			zoom: 14,
			animate: false,
		});
	}
}
