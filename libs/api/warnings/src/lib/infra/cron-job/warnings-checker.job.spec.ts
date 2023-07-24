import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { WarningsService } from '../../core/service/warnings.service';
import { WarningsCheckerJob } from './warnings-checker.job';

describe('WarningsCheckerJob', () => {
	it('should not start without cron expression', () => {
		const schedulerRegistry = createMock<SchedulerRegistry>();
		new WarningsCheckerJob(
			createMock<WarningsService>(),
			createMock<EventBus>(),
			{
				checkCronExpression: undefined,
			},
			schedulerRegistry,
		);

		expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
	});

	it('should start with cron expression', () => {
		const schedulerRegistry = createMock<SchedulerRegistry>();
		new WarningsCheckerJob(
			createMock<WarningsService>(),
			createMock<EventBus>(),
			{
				checkCronExpression: '* * * * *',
			},
			schedulerRegistry,
		);

		expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
			'warnings-checker',
			expect.any(CronJob),
		);
	});
});
