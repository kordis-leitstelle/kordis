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

import { OperationDeployment, Query } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import {
	ASSIGNMENT_QUERY_FIELDS,
	DeploymentCardComponent,
	UNIT_FRAGMENT,
} from '@kordis/spa/feature/deployment';

import {
	MapComponentPopup,
	MapPopupComponent,
} from '../popup/map-component-popup';

export interface LayerManager {
	readonly name: string;
	readonly defaultActive: boolean;
	init(map: Map): void;
	reInitAfterStyleChange(): void;
}

@Component({
	template: `
		<krd-deployment-card
			[clickable]="false"
			[name]="
				operationDeployment().operation.alarmKeyword +
				' ' +
				operationDeployment().operation.sign
			"
			[assignments]="operationDeployment().assignments"
		>
			<small>
				{{
					operationDeployment().operation.location.address.name +
						' ' +
						operationDeployment().operation.location.address.street
				}}
			</small>
		</krd-deployment-card>
	`,
	imports: [DeploymentCardComponent],
})
class OperationPopupComponent extends MapPopupComponent {
	readonly operationDeployment = input.required<OperationDeployment>();
}

@Injectable()
export class OperationsLayerManager implements LayerManager {
	readonly name = 'Einsätze';
	readonly defaultActive = true;

	private map!: Map;
	private readonly popup = new MapComponentPopup<OperationPopupComponent>(
		inject(ViewContainerRef),
		{
			closeButton: false,
			offset: 10,
			className: 'no-padding-popup',
		},
	);
	private readonly gqlService = inject(GraphqlService);
	private readonly operationsQuery = this.gqlService.query<{
		operationDeployments: Query['operationDeployments'];
	}>(gql`
		${UNIT_FRAGMENT}
		query {
			operationDeployments {
				operation {
					id
					sign
					alarmKeyword
					location {
						address {
							name
							street
						}
						coordinate {
							lat
							lon
						}
					}
				}
				assignments {
					${ASSIGNMENT_QUERY_FIELDS}
				}
			}
		}
	`);
	private readonly destroyRef = inject(DestroyRef);

	init(map: Map): void {
		this.map = map;
		map
			.loadImage('/assets/map-icons/operation.png')
			.then((image) => map.addImage('operation', image.data));

		this.initLayerWithData();
		this.subscribeForUpdates();

		this.initPopupListeners();
	}

	reInitAfterStyleChange(): void {
		this.initLayerWithData();
		this.operationsQuery.refresh();
	}

	private initLayerWithData(): void {
		this.operationsQuery.$.pipe(first()).subscribe(
			({ operationDeployments }) => {
				this.map.addSource('operations', {
					type: 'geojson',
					data: this.operationToFeatureCollection(operationDeployments),
				});

				this.map.addLayer({
					id: this.name,
					type: 'symbol',
					source: 'operations',
					layout: {
						'icon-image': 'operation',
						'icon-size': 0.5,
					},
				});
			},
		);
	}

	private subscribeForUpdates(): void {
		this.gqlService
			.subscribe$(gql`
				subscription {
					operationDeploymentCreated {
						id
					}
				}
			`)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(() => this.operationsQuery.refresh()),
			)
			.subscribe(({ operationDeployments }) =>
				(this.map.getSource('operations') as GeoJSONSource).setData(
					this.operationToFeatureCollection(operationDeployments),
				),
			);
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
					.setComponent(OperationPopupComponent, {
						operationDeployment: JSON.parse(
							(feature.properties as { data: string }).data,
						) as OperationDeployment,
					})
					.addTo(this.map);
			}
		});

		this.map.on('mouseleave', this.name, () => this.popup.remove());
	}

	private operationToFeatureCollection(
		operationDeployments: OperationDeployment[],
	): GeoJSON.FeatureCollection {
		return {
			type: 'FeatureCollection',
			features: operationDeployments.reduce((acc, operationDeployment) => {
				const { operation } = operationDeployment;
				if (!operation.location.coordinate) {
					return acc;
				}

				return [
					...acc,
					{
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [
								operation.location.coordinate.lon,
								operation.location.coordinate.lat,
							],
						},
						properties: { data: JSON.stringify(operationDeployment) }, // serialization issue https://github.com/maplibre/maplibre-gl-js/issues/1325
					},
				];
			}, [] as GeoJSON.Feature<GeoJSON.Point>[]),
		};
	}
}
