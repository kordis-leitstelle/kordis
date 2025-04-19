import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Map } from 'maplibre-gl';

import { MapLayer } from '@kordis/shared/model';

import {
	LayerManager,
	OperationsLayerManager,
} from './operations-layer-manager.service';
import { SignedInStationLayerManager } from './signed-in-stations-layer-manager.service';
import { SignedOffStationLayerManager } from './signed-off-stations-layer-manager.service';

@Injectable()
export class MapLayersService {
	readonly layers = signal<
		{
			name: string;
			active: WritableSignal<boolean>;
		}[]
	>([]);
	readonly activeStyle = signal<'street' | 'dark' | 'satellite'>('street');

	private map?: Map;

	private readonly krdLayers: LayerManager[] = [
		inject(OperationsLayerManager),
		inject(SignedInStationLayerManager),
		inject(SignedOffStationLayerManager),
	];

	setMap(map: Map): void {
		this.map = map;
	}

	initTenantLayers(layers: MapLayer[]): void {
		for (const layer of layers) {
			this.getMapSafe().addLayer({
				id: layer.name,
				type: 'raster',
				source: {
					type: 'raster',
					tiles: [layer.wmsUrl],
					tileSize: 256,
				},
				paint: {},
				layout: {
					visibility: layer.defaultActive ? 'visible' : 'none',
				},
			});
			this.layers.update((prev) => [
				...prev,
				{
					name: layer.name,
					active: signal(layer.defaultActive),
				},
			]);
		}
	}

	initKrdLayers(): void {
		for (const layer of this.krdLayers) {
			layer.init(this.getMapSafe());
			this.layers.update((prev) => [
				...prev,
				{
					name: layer.name,
					active: signal(layer.defaultActive),
				},
			]);
		}
	}

	// after a style change, we need to reinitialize the layers with the source
	reInitKrdLayers(): void {
		for (const layer of this.krdLayers) {
			layer.reInitAfterStyleChange();
			this.layers.update((prev) => [
				...prev,
				{
					name: layer.name,
					active: signal(layer.defaultActive),
				},
			]);
		}
	}

	toggleLayer(name: string): void {
		const mapLayer = this.getMapSafe().getLayer(name);
		const layerState = this.layers().find((l) => l.name === name);
		if (!mapLayer || !layerState) {
			throw new Error('Layer not found');
		}

		this.getMapSafe().setLayoutProperty(
			name,
			'visibility',
			layerState.active() ? 'none' : 'visible',
		);
		layerState.active.set(!layerState.active());
	}

	private getMapSafe(): Map {
		if (!this.map) {
			throw new Error('Map is not set');
		}
		return this.map;
	}
}
