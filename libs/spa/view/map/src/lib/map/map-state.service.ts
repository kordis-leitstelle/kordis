import { signal } from '@angular/core';

import { GeoAddress, GeoSearchResult } from '@kordis/spa/core/geocoding';

export enum MapStateType {
	Default,
	GeoInformation,
	NewOperation,
}

export type MapState =
	| {
			type: MapStateType.Default;
	  }
	| {
			type: MapStateType.GeoInformation;
			markerCoordinate?: { lat: number; lon: number };
			searchResult: GeoSearchResult;
	  }
	| {
			type: MapStateType.NewOperation;
			address?: GeoAddress;
	  };

export class MapStateService {
	readonly state = signal<MapState>({
		type: MapStateType.Default,
	});
}
