import { HttpClient } from '@angular/common/http';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	ViewContainerRef,
	inject,
} from '@angular/core';
import {
	takeUntilDestroyed,
	toObservable,
	toSignal,
} from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AimOutline, BarsOutline } from '@ant-design/icons-angular/icons';
import { Map, Marker } from 'maplibre-gl';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { map, shareReplay, skip } from 'rxjs';

import { Query } from '@kordis/shared/model';
import { AUTH_SERVICE } from '@kordis/spa/core/auth';
import {
	GeoSearchComponent,
	GeoSearchResult,
	GeoSearchService,
} from '@kordis/spa/core/geocoding';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { MapLayersService } from './layer/map-layers.service';
import { OperationsLayerManager } from './layer/operations-layer-manager.service';
import { SelectLayersComponent } from './layer/select-layers.component';
import { SignedInStationLayerManager } from './layer/signed-in-stations-layer-manager.service';
import { SignedOffStationLayerManager } from './layer/signed-off-stations-layer-manager.service';
import { MapContextMenuComponent } from './map-contex-menu.component';
import { MapStateService, MapStateType } from './map-state.service';
import { GeoResultPopupComponent } from './popup/geo-result-popup.component';
import { MapComponentPopup } from './popup/map-component-popup';

@Component({
	selector: 'krd-map',
	imports: [
		GeoSearchComponent,
		NzIconDirective,
		NzButtonComponent,
		NzPopoverDirective,
		FormsModule,
		GeoResultPopupComponent,
		SelectLayersComponent,
		NzCardComponent,
	],
	providers: [
		MapLayersService,
		MapStateService,
		OperationsLayerManager,
		SignedInStationLayerManager,
		SignedOffStationLayerManager,
	],
	templateUrl: './map.component.html',
	styleUrl: './map.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnDestroy {
	private readonly authService = inject(AUTH_SERVICE);
	private map!: Map;
	private readonly vcr = inject(ViewContainerRef);

	readonly mapState = inject(MapStateService);
	private readonly geoSearchService = inject(GeoSearchService);
	private readonly http = inject(HttpClient);
	private readonly geoSettings$ = inject(GraphqlService)
		.queryOnce$<{
			organization: Query['organization'];
		}>(
			gql`
				query GetGeoSettings($orgId: ID!) {
					organization(id: $orgId) {
						geoSettings {
							centroid {
								lat
								lon
							}
							mapStyles {
								streetUrl
								satelliteUrl
								darkUrl
							}
							mapLayers {
								name
								wmsUrl
								defaultActive
							}
						}
					}
				}
			`,
			{
				orgId: this.authService.user()?.organizationId,
			},
		)
		.pipe(
			map((result) => result.organization.geoSettings),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
	readonly geoSettings = toSignal(this.geoSettings$);
	readonly layerService = inject(MapLayersService);

	protected readonly MapStateType = MapStateType;

	private keyDownHandler = (event: KeyboardEvent): void => {
		if (event.key === 'Escape') {
			this.closePopup();
		}
	};
	private readonly geoResultMarker = new Marker({
		draggable: true,
	});

	constructor(iconService: NzIconService) {
		iconService.addIcon(BarsOutline, AimOutline);

		toObservable(this.layerService.activeStyle)
			.pipe(skip(1), takeUntilDestroyed())
			.subscribe((style) => {
				this.map.once('styledata', () => {
					// as the layers are mapped to the styles,
					this.layerService.layers.set([]);
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this.layerService.initTenantLayers(this.geoSettings()!.mapLayers);
					this.layerService.reInitKrdLayers();
				});

				this.map.setStyle(
					(this.geoSettings()?.mapStyles as { [key: string]: string })[
						style + 'Url'
					],
				);
			});

		this.initResultMarker();
	}

	ngAfterViewInit(): void {
		this.geoSettings$.subscribe((geoSettings) => {
			this.map = new Map({
				container: 'map',
				style: geoSettings.mapStyles.streetUrl,
				center: geoSettings.centroid,
				zoom: 10,
			});
			this.layerService.setMap(this.map);

			// load layers
			this.map.on('load', () => {
				this.layerService.initTenantLayers(geoSettings.mapLayers);
				this.layerService.initKrdLayers();
			});

			this.initContextMenu();

			document.addEventListener('keydown', this.keyDownHandler);
		});
	}

	ngOnDestroy(): void {
		document.removeEventListener('keydown', this.keyDownHandler);
	}

	onGeoResultSelected(result: GeoSearchResult): void {
		this.map.flyTo({
			center: result.coordinate,
			zoom: 16,
			animate: false,
		});

		this.geoResultMarker.setLngLat(result.coordinate).addTo(this.map);
		this.mapState.state.set({
			type: MapStateType.GeoInformation,
			markerCoordinate: result.coordinate,
			searchResult: result,
		});
	}

	centerMap(): void {
		this.map.flyTo({
			center: this.geoSettings()?.centroid,
			zoom: 10,
		});
	}

	closePopup(): void {
		this.mapState.state.set({
			type: MapStateType.Default,
		});
	}

	private initResultMarker(): void {
		toObservable(this.mapState.state)
			.pipe(takeUntilDestroyed())
			.subscribe((state) => {
				if (
					state.type === MapStateType.GeoInformation &&
					state.markerCoordinate
				) {
					this.geoResultMarker
						.setLngLat(state.markerCoordinate)
						.addTo(this.map);
				} else {
					this.geoResultMarker.remove();
				}
			});

		this.geoResultMarker.on('dragend', () => {
			const coord = {
				lat: this.geoResultMarker.getLngLat().lat,
				lon: this.geoResultMarker.getLngLat().lng,
			};
			this.geoSearchService.addressFromCoords(coord).subscribe((result) =>
				this.mapState.state.set({
					type: MapStateType.GeoInformation,
					markerCoordinate: coord,
					searchResult: result,
				}),
			);
		});
	}

	private initContextMenu(): void {
		const contextMenuPopup = new MapComponentPopup<MapContextMenuComponent>(
			this.vcr,
			{
				closeButton: false,
			},
		).setComponent(MapContextMenuComponent);

		this.map.on('contextmenu', (event) =>
			contextMenuPopup
				.setLngLat({
					lat: event.lngLat.lat,
					lon: event.lngLat.lng,
				})
				.addTo(this.map)
				.addClassName('no-padding-popup'),
		);

		this.map.on('click', () => contextMenuPopup.remove());
	}
}
