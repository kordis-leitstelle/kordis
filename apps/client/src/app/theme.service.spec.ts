import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
	let service: ThemeService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ThemeService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should toggle dark mode', async () => {
		const fn = jest.fn();
		const subscription = service.isDark$.subscribe((isDark) => fn(isDark));

		try {
			service.toggleDarkMode();

			expect(fn.mock.calls).toHaveLength(2);
			expect(fn.mock.calls[0][0]).toBe(false);
			expect(fn.mock.calls[1][0]).toBe(true);
		} finally {
			subscription.unsubscribe();
		}
	});
});
