import { TestBed } from '@angular/core/testing';

import { DeploymentsSearchStateService } from './deployments-search-state.service';

describe('DeploymentsSearchStateService', () => {
	let service: DeploymentsSearchStateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [DeploymentsSearchStateService],
		});

		service = TestBed.inject(DeploymentsSearchStateService);
	});

	it('should emit new value when searchValue is set', () =>
		new Promise<void>((done) => {
			const newValue = 'test search';

			service.searchValueChange$.subscribe((value) => {
				expect(value).toBe(newValue);
				done();
			});

			service.searchValue.set(newValue);
		}));
});
