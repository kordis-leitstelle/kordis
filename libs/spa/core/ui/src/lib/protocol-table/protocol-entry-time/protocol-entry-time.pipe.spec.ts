import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';

import { DateChangeService } from '../date-change/date-change.service';
import { ProtocolEntryTimePipe } from './protocol-entry-time.pipe';

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
	});

	it('should return the correct display value for today', () => {
		const date = new Date();
		const result = pipe.transform(date);
		expect(result).toContain('Heute');
	});

	it('should return the correct display value for yesterday', () => {
		const date = new Date();
		date.setDate(date.getDate() - 1);
		const result = pipe.transform(date);
		expect(result).toContain('Gestern');
	});

	it('should return the correct display value for a date within the last week', () => {
		const date = new Date();
		date.setDate(date.getDate() - 3);
		const result = pipe.transform(date);
		expect(result).toContain(
			date.toLocaleString(undefined, { weekday: 'long' }),
		);
	});

	it('should return the correct display value for a date within the last year', () => {
		const date = new Date();
		date.setMonth(date.getMonth() - 3);
		const result = pipe.transform(date);
		expect(result).toContain(
			date.toLocaleString(undefined, { day: '2-digit', month: '2-digit' }),
		);
	});

	it('should return the correct display value for a date older than a year', () => {
		const date = new Date();
		date.setFullYear(date.getFullYear() - 2);
		const result = pipe.transform(date);
		expect(result).toContain(
			date.toLocaleString(undefined, {
				day: '2-digit',
				month: '2-digit',
				year: '2-digit',
			}),
		);
	});
});
