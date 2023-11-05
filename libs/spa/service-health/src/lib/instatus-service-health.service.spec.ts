import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { InstatusServiceHealthService } from './instatus-service-health.service';
import { DatePipe } from '@angular/common';
import { lastValueFrom, take, toArray } from 'rxjs';

Object.defineProperty(URL, 'createObjectURL', {
	value: jest.fn(),
});

class MockWorker {
	static mockInstanceSingleton: MockWorker | null;
	onmessage!: (payload: { data: unknown }) => void;

	constructor() {
		MockWorker.mockInstanceSingleton = this;
	}
}

Object.defineProperty(window, 'Worker', {
	value: MockWorker,
});

const EXAMPLE_INSTATUS_RESPONSE = Object.freeze({
	activeIncidents: [
		{
			id: 'someid1',
			name: 'test',
			status: 'INVESTIGATING',
			impact: 'MAJOROUTAGE',
			url: 'https://kordis.instatus.com/someid1',
		},
	],
	activeMaintenances: [
		{
			id: 'someid3',
			name: 'test',
			start: '2023-11-05T15:36:34.932Z',
			status: 'NOTSTARTEDYET',
			duration: 60,
			url: 'https://kordis.instatus.com/someid3',
		},
	],
});

describe('InstatusServiceHealthService', () => {
	let spectator: SpectatorService<InstatusServiceHealthService>;
	let service: InstatusServiceHealthService;

	// Prepare the service factory
	const createService = createServiceFactory({
		service: InstatusServiceHealthService,
		providers: [DatePipe],
	});

	beforeEach(() => {
		spectator = createService({
			providers: [
				{ provide: 'instatusUrl', useValue: 'https://kordis.instatus.com' },
				{ provide: 'checkIntervalMs', useValue: 60000 },
			],
		});
		service = spectator.service;
	});

	afterEach(() => {
		MockWorker.mockInstanceSingleton = null;
	});

	it('should emit correct service status reports', async () => {
		MockWorker.mockInstanceSingleton?.onmessage({
			data: EXAMPLE_INSTATUS_RESPONSE,
		});

		await expect(
			lastValueFrom(service.serviceStatusChanged$.pipe(take(2), toArray())),
		).resolves.toEqual([
			{
				message: 'test. Auswirkung: Großer Ausfall',
				status: 'down',
				url: 'https://kordis.instatus.com/someid1',
			},
			{
				message: 'test - am 16:36 05.11. für 60 Minuten.',
				status: 'maintenance_scheduled',
				url: 'https://kordis.instatus.com/someid3',
			},
		]);
	});

	it('should emit changed status', async () => {
		MockWorker.mockInstanceSingleton?.onmessage({
			data: EXAMPLE_INSTATUS_RESPONSE,
		});
		MockWorker.mockInstanceSingleton?.onmessage({
			data: {
				activeIncidents: [
					{
						id: 'someid1',
						name: 'test',
						status: 'RESOLVED',
						url: 'https://kordis.instatus.com/someid1',
					},
				],
				activeMaintenances: [
					{
						id: 'someid3',
						name: 'test',
						start: '2023-11-05T15:36:34.932Z',
						status: 'INPROGRESS',
						duration: 60,
						url: 'https://kordis.instatus.com/someid3',
					},
				],
			},
		});

		await expect(
			lastValueFrom(service.serviceStatusChanged$.pipe(take(2), toArray())),
		).resolves.toEqual([
			{
				message: 'test',
				status: 'up',
				url: 'https://kordis.instatus.com/someid1',
			},
			{
				message: 'test - bis 17:36 05.11.',
				status: 'maintenance',
				url: 'https://kordis.instatus.com/someid3',
			},
		]);
	});
});