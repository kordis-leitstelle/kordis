import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';

import { GeoFeature } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import { EntitySearchEngine } from '@kordis/spa/core/ui';

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
	private readonly gqlService = inject(GraphqlService);
	private readonly searchService = new EntitySearchEngine<GeoSearchResult>(
		(entity, searchTerm) => {
			const preprocessedSearchTerm = searchTerm.toLowerCase().trim();
			const preprocessedComparable = entity.displayValue.toLowerCase();
			return preprocessedComparable.includes(preprocessedSearchTerm);
		},
	);

	constructor() {
		// preload geo features into the search service
		this.gqlService
			.queryOnce$<{ geoFeatures: GeoFeature[] }>(gql`
				query {
					geoFeatures {
						coordinate {
							lat
							lon
						}
						name
						street
						city
						postalCode
					}
				}
			`)
			.subscribe(({ geoFeatures }) =>
				this.searchService.setSearchableEntities(
					geoFeatures.map(
						(feature) =>
							({
								displayValue:
									feature.name && feature.street
										? `${feature.name}, ${feature.street}, ${feature.postalCode} ${feature.city}`
										: feature.street
											? `${feature.street}, ${feature.postalCode} ${feature.city}`
											: feature.name,
								coordinate: {
									lat: feature.coordinate.lat,
									lon: feature.coordinate.lon,
								},
								address: {
									name: feature.name,
									city: feature.city,
									street: feature.street,
									postalCode: feature.postalCode,
								},
							}) as GeoSearchResult,
					),
				),
			);
	}

	async search(query: string, types?: string[]): Promise<GeoSearchResult[]> {
		if (!query) {
			return [];
		}

		const url = `https://api.maptiler.com/geocoding/${query}.json?autocomplete=true&${
			types ? `types=${types.join(',')}&` : ''
		}language=de&proximity=9.993682,53.551086&key=${this.mapTilerKey}`;

		const krdGeoFeatureResult = this.searchService.search(query);

		const mapTilerResults = await firstValueFrom(
			this.httpClient
				.get<{
					features: MaptilerFeature[];
				}>(url)
				.pipe(
					map((res) =>
						res.features.map((f) => this.featureToGeoSearchResult(f)),
					),
				),
		);

		return [...krdGeoFeatureResult, ...mapTilerResults];
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
