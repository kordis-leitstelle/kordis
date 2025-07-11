import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { GeocodingModule, MAP_TILER_KEY } from '../geocoding.module';
import { GeoSearchResult } from '../model/geo-search-result.interface';

type MaptilerFeature = {
	place_name_de: string;
	center: [number, number];
};

// as maptiler is a temporary solution and the future provider offers a different api, this service is not implemented as a generic geocoding service
@Injectable({
	providedIn: GeocodingModule,
})
export class GeoSearchService {
	private readonly mapTilerKey = inject(MAP_TILER_KEY);
	private readonly httpClient = new HttpClient(inject(HttpBackend));

	search(query: string, types?: string[]): Observable<GeoSearchResult[]> {
		if (!query) {
			return of([]);
		}

		const url = `https://api.maptiler.com/geocoding/${query}.json?autocomplete=true&${
			types ? `types=${types.join(',')}&` : ''
		}language=de&proximity=9.993682,53.551086&key=${this.mapTilerKey}`;

		return this.httpClient
			.get<{
				features: MaptilerFeature[];
			}>(url)
			.pipe(
				map((res) => res.features.map((f) => this.featureToGeoSearchResult(f))),
			);
	}

	addressFromCoords(coordinate: {
		lat: number;
		lon: number;
	}): Observable<GeoSearchResult> {
		const url = `https://api.maptiler.com/geocoding/${coordinate.lon},${coordinate.lat}.json?language=de&types=address&key=${this.mapTilerKey}`;

		return this.httpClient
			.get<{
				features: MaptilerFeature[];
			}>(url)
			.pipe(map((res) => this.featureToGeoSearchResult(res.features[0])));
	}

	private featureToGeoSearchResult(f: MaptilerFeature): GeoSearchResult {
		const address = {
			city: '',
			street: '',
			postalCode: '',
		};
		const components = f.place_name_de.split(', ');
		if (components.length > 0) {
			address.street = components[0];
		}
		if (components.length >= 1) {
			const cityComponent = components[1];
			const cityComponents = cityComponent.split(' ');

			if (cityComponents.length > 1) {
				address.postalCode = cityComponents[0];
				address.city = cityComponents[1];
			}
		}

		return {
			displayValue: f.place_name_de,
			coordinate: {
				lat: f.center[1],
				lon: f.center[0],
			},
			address,
		};
	}
}
