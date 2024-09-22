import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class ResetAlertGroupUnitsCommand {
	constructor(public organizationId: string) {}
}

@CommandHandler(ResetAlertGroupUnitsCommand)
export class ResetAlertGroupUnitsHandler {
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly alertGroupRepository: AlertGroupRepository,
	) {}

	async execute(command: ResetAlertGroupUnitsCommand): Promise<void> {
		await this.alertGroupRepository.resetCurrentUnitsToDefaultUnits(
			command.organizationId,
		);
	}
}
