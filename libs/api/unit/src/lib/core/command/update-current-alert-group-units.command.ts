import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class UpdateCurrentAlertGroupUnitsCommand {
	constructor(
		readonly orgId: string,
		readonly alertGroupId: string,
		readonly unitIds: string[],
	) {}
}

@CommandHandler(UpdateCurrentAlertGroupUnitsCommand)
export class UpdateCurrentAlertGroupUnitsHandler
	implements ICommandHandler<UpdateCurrentAlertGroupUnitsCommand, boolean>
{
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly repository: AlertGroupRepository,
	) {}

	async execute({
		unitIds,
		alertGroupId,
		orgId,
	}: UpdateCurrentAlertGroupUnitsCommand): Promise<boolean> {
		return this.repository.updateCurrentUnits(orgId, alertGroupId, unitIds);
	}
}
