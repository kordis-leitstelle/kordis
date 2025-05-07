import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GeoJSONSource, Map, Popup } from 'maplibre-gl';
import { first, switchMap } from 'rxjs';

import { Query, RescueStationDeployment } from '@kordis/shared/model';
import {
	MultiSubscriptionService,
	QueryReturnType,
	SubscriptionField,
} from '@kordis/spa/core/graphql';

export abstract class AbstractStationLayerManager {
	abstract name: string;
	abstract defaultActive: boolean;
	abstract iconPath: string;
	abstract query: QueryReturnType<{
		rescueStationDeployments: Query['rescueStationDeployments'];
	}>;
	abstract subscriptionFields: SubscriptionField[];

	protected map!: Map;
	protected readonly popup = this.makePopup();
	protected readonly destroyRef = inject(DestroyRef);
	protected readonly multiSubscriptionService = inject(
		MultiSubscriptionService,
	);

	protected abstract setPopupContent(station: RescueStationDeployment): void;
	protected abstract makePopup(): Popup;

	init(map: Map): void {
		this.map = map;
		map
			.loadImage(this.iconPath)
			.then((image) => map.addImage(this.name, image.data));

		this.initData();
		this.initSubscription();
		this.initPopupListeners();
	}

	reInitAfterStyleChange(): void {
		this.initData();
		this.query.refresh();
	}

	private initData(): void {
		this.query.$.pipe(first()).subscribe(({ rescueStationDeployments }) => {
			const features = this.makeFeaturesFromDeployments(
				rescueStationDeployments,
			);

			this.map.addSource(this.name, {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features,
				},
			});

			this.map.addLayer({
				id: this.name,
				type: 'symbol',
				source: this.name,
				layout: {
					'icon-image': this.name,
					'icon-size': 0.5,
				},
			});
		});
	}

	private initSubscription(): void {
		this.multiSubscriptionService
			.subscribeToMultiple$(this.subscriptionFields)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(() => this.query.refresh()),
			)
			.subscribe(({ rescueStationDeployments }) => {
				(this.map.getSource(this.name) as GeoJSONSource)?.setData({
					type: 'FeatureCollection',
					features: this.makeFeaturesFromDeployments(rescueStationDeployments),
				});
			});
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

				this.popup.setLngLat({
					lng: (feature.geometry as GeoJSON.Point).coordinates[0],
					lat: (feature.geometry as GeoJSON.Point).coordinates[1],
				});
				this.setPopupContent(station);
				this.popup.addTo(this.map);
			}
		});

		this.map.on('mouseleave', this.name, () => this.popup.remove());
	}

	protected makeFeaturesFromDeployments(
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
