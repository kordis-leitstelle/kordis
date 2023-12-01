import { TestBed } from '@angular/core/testing';

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { UpdateService } from './update.service';

describe('UpdateService', () => {
	let swUpdateMock: DeepMocked<SwUpdate>;
	let windowSpy: jest.SpyInstance;
	const versionUpdateSubject$ = new Subject();

	beforeEach(() => {
		windowSpy = jest.spyOn(window, 'confirm');
		swUpdateMock = createMock<SwUpdate>({
			// eslint-disable-next-line rxjs/finnish
			versionUpdates: versionUpdateSubject$.asObservable(),
		});
		TestBed.configureTestingModule({
			providers: [
				{
					provide: SwUpdate,
					useValue: swUpdateMock,
				},
			],
		});
		TestBed.inject(UpdateService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should ask for update permission when a new version is ready', () =>
		new Promise<void>((done) => {
			swUpdateMock.versionUpdates.subscribe(() => {
				console.log('hi');
				expect(windowSpy).toHaveBeenCalled();
				done();
			});
			versionUpdateSubject$.next({
				type: 'VERSION_READY',
			});
		}));

	it('should reload page if permission given', () => {
		Object.defineProperty(window, 'location', {
			value: { reload: jest.fn(), hash: {} },
		});
		windowSpy.mockReturnValue(true);
		const reloadSpy = jest.spyOn(window.location, 'reload');

		versionUpdateSubject$.next({
			type: 'VERSION_READY',
		});

		expect(reloadSpy).toHaveBeenCalled();
	});
});
