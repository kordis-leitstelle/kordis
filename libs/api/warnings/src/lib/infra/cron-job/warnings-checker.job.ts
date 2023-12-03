import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { KordisLogger } from '@kordis/api/observability';

import { NewWarningEvent } from '../../core/event/new-warning.event';
import {
	WARNING_SERVICE,
	WarningsService,
} from '../../core/service/warnings.service';
import {
	MODULE_OPTIONS_TOKEN,
	WarningOptions,
} from '../warnings.module-options';

@Injectable()
export class WarningsCheckerJob {
	private readonly logger: KordisLogger = new Logger(WarningsCheckerJob.name);

	constructor(
		@Inject(WARNING_SERVICE) private readonly warningService: WarningsService,
		private readonly eventBus: EventBus,
		@Inject(MODULE_OPTIONS_TOKEN) options: WarningOptions,
		schedulerRegistry: SchedulerRegistry,
	) {
		if (options.checkCronExpression) {
			this.logger.log('process id: ' + process.pid);
			// runs in a cron job instead of rxjs interval to run in a separate child process
			const job = new CronJob(
				options.checkCronExpression,
				() => this.checkForNewWarningsAndPublish(),
				undefined,
				undefined,
				undefined,
				undefined,
				true,
			);
			schedulerRegistry.addCronJob('warnings-checker', job);
			job.start();
			this.logger.log(
				`Warning checker enabled with ${options.checkCronExpression}`,
			);
		} else {
			this.logger.log(
				'Warning checker is disabled! Existing Warnings might be outdated!',
			);
		}
	}

	private async checkForNewWarningsAndPublish(): Promise<void> {
		this.logger.log('Checking for new warnings');
		const newWarnings = await this.warningService.getNewWarnings();
		this.logger.log(
			`Found ${newWarnings.length} new warnings, publishing them.`,
		);

		for (const warning of newWarnings) {
			this.eventBus.publish(new NewWarningEvent(warning));
		}
	}
}
