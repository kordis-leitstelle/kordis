import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Map } from 'maplibre-gl';

import { MapLayersService } from './map-layers.service';
import { OperationsLayerManager } from './operations-layer-manager.service';
import { SignedInStationLayerManager } from './signed-in-stations-layer-manager.service';
import { SignedOffStationLayerManager } from './signed-off-stations-layer-manager.service';

describe('MapLayersService', () => {
	let service: MapLayersService;
	let mockMap: DeepMocked<Map>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MapLayersService,
				{
					provide: OperationsLayerManager,
					useValue: createMock(),
				},
				{
					provide: SignedOffStationLayerManager,
					useValue: createMock(),
				},
				{
					provide: SignedInStationLayerManager,
					useValue: createMock(),
				},
			],
		});
		mockMap = createMock();
		service = TestBed.inject(MapLayersService);
		service.setMap(mockMap);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should initialize layers', () => {
		const layers = [
			{
				name: 'Layer1',
				wmsUrl: 'http://example.com/layer1',
				defaultActive: true,
			},
			{
				name: 'Layer2',
				wmsUrl: 'http://example.com/layer2',
				defaultActive: false,
			},
		];

		service.initTenantLayers(layers);

		expect(mockMap.addLayer).toHaveBeenCalledTimes(2);
		expect(service.layers().length).toBe(2);
		expect(service.layers()[0].name).toBe('Layer1');
		expect(service.layers()[0].active()).toBe(true);
		expect(service.layers()[1].name).toBe('Layer2');
		expect(service.layers()[1].active()).toBe(false);
	});

	it('should toggle layer visibility', () => {
		const layers = [
			{
				name: 'Layer1',
				wmsUrl: 'http://example.com/layer1',
				defaultActive: true,
			},
		];

		service.initTenantLayers(layers);
		mockMap.getLayer.mockReturnValue({ id: 'Layer1' } as any);

		service.toggleLayer('Layer1');

		expect(mockMap.setLayoutProperty).toHaveBeenCalledWith(
			'Layer1',
			'visibility',
			'none',
		);
		expect(service.layers()[0].active()).toBe(false);

		service.toggleLayer('Layer1');

		expect(mockMap.setLayoutProperty).toHaveBeenCalledWith(
			'Layer1',
			'visibility',
			'visible',
		);
		expect(service.layers()[0].active()).toBe(true);
	});
});
