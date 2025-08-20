import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { MAP_TILER_KEY } from '../geocoding.module';
import { GeoSearchService } from './geo-search.service';

describe('GeoSearchService', () => {
	let service: GeoSearchService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				GeoSearchService,
				provideHttpClient(),
				provideHttpClientTesting(),
				{
					provide: MAP_TILER_KEY,
					useValue: 'very_secret_key',
				},
				{
					provide: GraphqlService,
					useValue: {
						queryOnce$: jest.fn().mockReturnValue(of()),
					},
				},
			],
		});
		service = TestBed.inject(GeoSearchService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
