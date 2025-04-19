import {
	Component,
	DestroyRef,
	Injectable,
	ViewContainerRef,
	inject,
	input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GeoJSONSource, Map } from 'maplibre-gl';
import { first, switchMap } from 'rxjs';

import { Query, RescueStationDeployment } from '@kordis/shared/model';
import {
	GraphqlService,
	MultiSubscriptionService,
	gql,
} from '@kordis/spa/core/graphql';
import {
	ASSIGNMENT_QUERY_FIELDS,
	DeploymentCardComponent,
	RescueStationDeploymentCardHeaderComponent,
	UNIT_FRAGMENT,
} from '@kordis/spa/feature/deployment';

import {
	MapComponentPopup,
	MapPopupComponent,
} from '../popup/map-component-popup';
import { LayerManager } from './operations-layer-manager.service';

@Component({
	imports: [
		DeploymentCardComponent,
		RescueStationDeploymentCardHeaderComponent,
	],
	template: `
		<krd-deployment-card
			[clickable]="false"
			[name]="stationDeployment().name"
			[assignments]="stationDeployment().assignments"
		>
			<krd-rescue-station-deployment-card-header
				role="sub-header"
				[rescueStation]="stationDeployment()"
			/>
		</krd-deployment-card>
	`,
})
class StationPopupComponent extends MapPopupComponent {
	readonly stationDeployment = input.required<RescueStationDeployment>();
}

@Injectable()
export class SignedInStationLayerManager implements LayerManager {
	name = 'Eingemeldete Stationen';
	defaultActive = true;

	private readonly multiSubscriptionService = inject(MultiSubscriptionService);
	private readonly query = inject(GraphqlService).query<{
		rescueStationDeployments: Query['rescueStationDeployments'];
	}>(
		gql`
			${UNIT_FRAGMENT}
			query {
				rescueStationDeployments(signedIn: true) {
					id
					name
					location {
						address {
							street
						}
						coordinate {
							lat
							lon
						}
					}
					strength {
						helpers
						leaders
						subLeaders
					}
					assignments {
						${ASSIGNMENT_QUERY_FIELDS}
					}
				}
			}
		`,
	);
	private map!: Map;
	private readonly popup = new MapComponentPopup<StationPopupComponent>(
		inject(ViewContainerRef),
		{
			closeButton: false,
			offset: 15,
			className: 'no-padding-popup',
		},
	);
	private readonly destroyRef = inject(DestroyRef);

	init(map: Map): void {
		this.map = map;
		map
			.loadImage('/assets/map-icons/station-signedin.png')
			.then((image) => map.addImage('station-signedin', image.data));

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

			this.map.addSource('stations-signedin', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features,
				},
			});

			this.map.addLayer({
				id: this.name,
				type: 'symbol',
				source: 'stations-signedin',
				layout: {
					'icon-image': 'station-signedin',
					'icon-size': 0.5,
				},
			});
		});
	}

	private initSubscription(): void {
		this.multiSubscriptionService
			.subscribeToMultiple$([
				'signedInRescueStationUpdated',
				'rescueStationSignedIn',
				{ field: 'rescueStationsReset', queryFields: null },
				'rescueStationNoteUpdated',
			])
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(() => this.query.refresh()),
			)
			.subscribe(({ rescueStationDeployments }) => {
				(this.map.getSource('stations-signedin') as GeoJSONSource)?.setData({
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

				this.popup
					.setLngLat({
						lng: (feature.geometry as GeoJSON.Point).coordinates[0],
						lat: (feature.geometry as GeoJSON.Point).coordinates[1],
					})
					.setComponent(StationPopupComponent, {
						stationDeployment: JSON.parse(
							(feature.properties as { data: string }).data,
						) as RescueStationDeployment,
					})
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
