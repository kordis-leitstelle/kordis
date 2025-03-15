import { Test, TestingModule } from '@nestjs/testing';

import { DateChangeService } from './date-change.service';

describe('DateChangeService', () => {
	let service: DateChangeService;
	const startTime = new Date('1913-10-18 23:59:59');
	let subscriber: jest.Mock;

	beforeEach(async () => {
		jest.useFakeTimers({
			now: startTime,
		});

		const module: TestingModule = await Test.createTestingModule({
			providers: [DateChangeService],
		}).compile();

		service = module.get<DateChangeService>(DateChangeService);
		subscriber = jest.fn();
		service.dayChange$.subscribe(subscriber);
	});

	it('Emits on first date change', () => {
		jest.advanceTimersByTime(1000);

		expect(subscriber).toHaveBeenCalledTimes(1);
	});

	it('Emits on subsequent date changes', () => {
		jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 1000);

		expect(subscriber).toHaveBeenCalledTimes(2);
	});
});
