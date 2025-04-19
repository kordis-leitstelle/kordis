import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Map, Popup } from 'maplibre-gl';
import { first, switchMap } from 'rxjs';

import { Query, RescueStationDeployment } from '@kordis/shared/model';
import {
	GraphqlService,
	MultiSubscriptionService,
	gql,
} from '@kordis/spa/core/graphql';

import { LayerManager } from './operations-layer-manager.service';

@Injectable()
export class SignedOffStationLayerManager implements LayerManager {
	name = 'Ausgemeldete Stationen';
	defaultActive = false;

	private readonly query = inject(GraphqlService).query<{
		rescueStationDeployments: Query['rescueStationDeployments'];
	}>(gql`
		query {
			rescueStationDeployments(signedIn: false) {
				id
				name
				location {
					coordinate {
						lat
						lon
					}
					address {
						street
					}
				}
			}
		}
	`);
	private readonly multiSubscription = inject(MultiSubscriptionService);
	private map!: Map;
	private readonly popup = new Popup({
		closeButton: false,
		offset: 15,
	});
	private readonly destroyRef = inject(DestroyRef);

	init(map: Map): void {
		this.map = map;
		map
			.loadImage('/assets/map-icons/station-signedoff.png')
			.then((image) => map.addImage('station-signedoff', image.data));

		this.initData();
		this.initSubscription();
		this.initPopupListeners();
	}

	reInitAfterStyleChange(): void {
		this.initData();
	}

	private initData(): void {
		this.query.$.pipe(first()).subscribe(({ rescueStationDeployments }) => {
			const features = this.makeFeaturesFromDeployments(
				rescueStationDeployments,
			);

			this.map.addSource('stations-signedoff', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features,
				},
			});

			this.map.addLayer({
				id: this.name,
				type: 'symbol',
				source: 'stations-signedoff',
				layout: {
					'icon-image': 'station-signedoff',
					'icon-size': 0.5,
				},
			});
		});
	}

	private initSubscription(): void {
		this.multiSubscription
			.subscribeToMultiple$([
				{ field: 'rescueStationsReset', queryFields: null },
				'rescueStationSignedIn',
				'rescueStationSignedOff',
			])
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(() => this.query.refresh()),
			)
			.subscribe();
	}

	private initPopupListeners(): void {
		this.map.on('mousemove', this.name, (event) => {
			const features = this.map.queryRenderedFeatures(event.point, {
				layers: [this.name],
			});

			if (features.length > 0) {
				const feature = features[0];
				const station = JSON.parse(
					(feature.properties as { data: string }).data,
				) as RescueStationDeployment;
				this.popup
					.setLngLat({
						lng: (feature.geometry as GeoJSON.Point).coordinates[0],
						lat: (feature.geometry as GeoJSON.Point).coordinates[1],
					})
					.setText(station.name + ' - Ausgemeldet')
					.addTo(this.map);
			}
		});

		this.map.on('mouseleave', this.name, () => this.popup.remove());
	}

	private makeFeaturesFromDeployments(
		rescueStationDeployments: RescueStationDeployment[],
	): GeoJSON.Feature<GeoJSON.Point>[] {
		return rescueStationDeployments.map(
			(station) =>
				({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [
							station.location.coordinate.lon,
							station.location.coordinate.lat,
						],
					},
					properties: { data: JSON.stringify(station) },
				}) as GeoJSON.Feature<GeoJSON.Point>,
		);
	}
}
