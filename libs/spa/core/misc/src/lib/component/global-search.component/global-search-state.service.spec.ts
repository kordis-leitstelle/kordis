import { TestBed } from '@angular/core/testing';

import { GlobalSearchStateService } from './global-search-state.service';

describe('GlobalSearchStateService', () => {
	let service: GlobalSearchStateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [GlobalSearchStateService],
		});

		service = TestBed.inject(GlobalSearchStateService);
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
