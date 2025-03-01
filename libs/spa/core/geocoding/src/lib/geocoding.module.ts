import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

import { GeoSearchService } from './service/geo-search.service';

export const MAP_TILER_KEY = new InjectionToken<string>('MAP_TILER_KEY');

@NgModule({})
export class GeocodingModule {
	static forRoot(mapTilerKey: string): ModuleWithProviders<GeocodingModule> {
		return {
			ngModule: GeocodingModule,
			providers: [
				{
					provide: MAP_TILER_KEY,
					useValue: mapTilerKey,
				},
				GeoSearchService,
			],
		};
	}
}
