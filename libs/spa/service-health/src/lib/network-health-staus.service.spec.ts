import { firstValueFrom, skip } from 'rxjs';
import { NetworkHealthStatusService } from './network-health-staus.service';

describe('NetworkHealthStatusService', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should emit true as initial status when the browser is online', async () => {
		Object.defineProperty(navigator, 'onLine', {
			value: true,
		});

		const status = await firstValueFrom(
			new NetworkHealthStatusService().statusChanged$,
		);
		expect(status).toBe(true);
	});

	it('should emit false as initial status when the browser is offline', async () => {
		Object.defineProperty(navigator, 'onLine', {
			value: false,
		});

		const status = await firstValueFrom(
			new NetworkHealthStatusService().statusChanged$,
		);
		expect(status).toBe(false);
	});

	it('should emit false when the window goes offline', async () => {
		Object.defineProperty(navigator, 'onLine', {
			value: true,
		});

		let eventValue: Promise<boolean>;
		const offlineHandler: EventListener = await new Promise((resolve) => {
			jest
				.spyOn(window, 'addEventListener')
				.mockImplementation((event, handler) => {
					if (event === 'offline') {
						resolve(handler as EventListener);
					}
				});
			eventValue = firstValueFrom(
				new NetworkHealthStatusService().statusChanged$.pipe(skip(1)),
			);
		});

		offlineHandler(new Event('offline'));
		await expect(eventValue!).resolves.toBe(false);
	});

	it('should emit true when the window goes online', async () => {
		Object.defineProperty(navigator, 'onLine', {
			value: false,
		});

		let statusChangeValuePromise: Promise<boolean>;
		const onlineHandler: EventListener = await new Promise((resolve) => {
			jest
				.spyOn(window, 'addEventListener')
				.mockImplementation((event, handler) => {
					if (event === 'online') {
						resolve(handler as EventListener);
					}
				});
			statusChangeValuePromise = firstValueFrom(
				new NetworkHealthStatusService().statusChanged$.pipe(skip(1)),
			);
		});

		onlineHandler(new Event('online'));
		await expect(statusChangeValuePromise!).resolves.toBe(true);
	});
});
