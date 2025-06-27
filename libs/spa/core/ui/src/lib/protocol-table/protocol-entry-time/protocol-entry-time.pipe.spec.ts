import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { DateChangeService } from '../date-change/date-change.service';
import { ProtocolEntryTimePipe } from './protocol-entry-time.pipe';

const today = new Date('2025-01-20T12:00:00.000+01:00');
const oneDayInMs = 24 * 60 * 60 * 1000;

describe('ProtocolEntryTimePipe', () => {
	let pipe: ProtocolEntryTimePipe;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ProtocolEntryTimePipe,
				{
					provide: DateChangeService,
					useValue: createMock(),
				},
				{ provide: ChangeDetectorRef, useValue: createMock() },
			],
		});

		pipe = TestBed.inject(ProtocolEntryTimePipe);

		jest.useFakeTimers({
			now: today,
		});
	});

	it('should return relative day for "$difference"', () => {
		expect(pipe.transform(today.toISOString())).toContain('Heute');

		expect(
			pipe.transform(new Date(today.getTime() - oneDayInMs).toISOString()),
		).toContain('Gestern');
	});

	it('should return the weekday for dates 2-6 days ago', () => {
		const twoDaysAgo = new Date(today.getTime() - 2 * oneDayInMs);
		expect(pipe.transform(twoDaysAgo.toISOString())).toContain(
			twoDaysAgo.toLocaleString(undefined, { weekday: 'long' }),
		);

		const sixDaysAgo = new Date(today.getTime() - 6 * oneDayInMs);
		expect(pipe.transform(sixDaysAgo.toISOString())).toContain(
			sixDaysAgo.toLocaleString(undefined, { weekday: 'long' }),
		);
	});

	it('should return the day and month for dates 7-365 days ago', () => {
		const sevenDaysAgo = new Date(today.getTime() - 7 * oneDayInMs);
		expect(pipe.transform(sevenDaysAgo.toISOString())).toContain(
			sevenDaysAgo.toLocaleString(undefined, {
				day: '2-digit',
				month: '2-digit',
			}),
		);

		const oneYearAgo = new Date(today.getTime() - 365 * oneDayInMs);
		expect(pipe.transform(oneYearAgo.toISOString())).toContain(
			oneYearAgo.toLocaleString(undefined, {
				day: '2-digit',
				month: '2-digit',
			}),
		);
	});

	it('should return full date for date more than a year ago', () => {
		const moreThanOneYearAgo = new Date(today.getTime() - 366 * oneDayInMs);
		expect(pipe.transform(moreThanOneYearAgo.toISOString())).toContain(
			moreThanOneYearAgo.toLocaleString(undefined, {
				day: '2-digit',
				month: '2-digit',
				year: '2-digit',
			}),
		);
	});
});
