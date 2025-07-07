import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Subject } from 'rxjs';

import { UpdateService } from './update.service';

describe('UpdateService', () => {
	let swUpdateMock: DeepMocked<SwUpdate>;
	let windowSpy: jest.SpyInstance;
	const versionUpdateSubject$ = new Subject();

	beforeEach(() => {
		windowSpy = jest.spyOn(window, 'confirm');
		swUpdateMock = createMock<SwUpdate>({
			// eslint-disable-next-line @smarttools/rxjs/finnish
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
		Object.defineProperty(window, 'location', {
			value: { reload: jest.fn(), hash: {} },
		});
		windowSpy.mockReturnValue(true);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should ask for update permission when a new version is ready', () =>
		new Promise<void>((done) => {
			swUpdateMock.versionUpdates.subscribe(() => {
				expect(windowSpy).toHaveBeenCalled();
				done();
			});
			versionUpdateSubject$.next({
				type: 'VERSION_READY',
			});
		}));

	it('should reload page if permission given', () => {
		const reloadSpy = jest.spyOn(window.location, 'reload');

		versionUpdateSubject$.next({
			type: 'VERSION_READY',
		});

		expect(reloadSpy).toHaveBeenCalled();
	});
});
