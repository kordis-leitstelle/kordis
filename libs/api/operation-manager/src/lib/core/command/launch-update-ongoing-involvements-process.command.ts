import { CommandBus, CommandHandler, QueryBus } from '@nestjs/cqrs';

import {
	GetOperationByIdQuery,
	OperationViewModel,
	UpdateOngoingOperationInvolvementsCommand,
} from '@kordis/api/operation';
import {
	CreateOperationAssignmentsUpdatedMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { UnitsPopulateService } from '../service/units-populate.service';

export class LaunchUpdateOngoingInvolvementsProcessCommand {
	constructor(
		readonly reqUser: AuthUser,
		readonly operationId: string,
		readonly assignments: {
			assignedUnitIds: string[];
			assignedAlertGroups: {
				alertGroupId: string;
				assignedUnitIds: string[];
			}[];
		},
		readonly protocolData: {
			sender: MessageUnit;
			recipient: MessageUnit;
			channel: string;
		},
	) {}
}

@CommandHandler(LaunchUpdateOngoingInvolvementsProcessCommand)
export class LaunchUpdateOngoingInvolvementsProcessHandler {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly unitsPopulateService: UnitsPopulateService,
	) {}

	async execute(
		cmd: LaunchUpdateOngoingInvolvementsProcessCommand,
	): Promise<void> {
		await this.commandBus.execute(
			new UpdateOngoingOperationInvolvementsCommand(
				cmd.reqUser.organizationId,
				cmd.operationId,
				cmd.assignments.assignedUnitIds,
				cmd.assignments.assignedAlertGroups,
			),
		);

		const { assignedUnits, assignedAlertGroups } =
			await this.unitsPopulateService.getPopulatedUnitsAndAlertGroups(
				cmd.assignments.assignedUnitIds,
				cmd.assignments.assignedAlertGroups,
			);

		const operation: OperationViewModel = await this.queryBus.execute(
			new GetOperationByIdQuery(cmd.reqUser.organizationId, cmd.operationId),
		);

		await this.commandBus.execute(
			new CreateOperationAssignmentsUpdatedMessageCommand(
				cmd.protocolData.sender,
				cmd.protocolData.recipient,
				cmd.protocolData.channel,
				new Date(),
				{
					operationId: cmd.operationId,
					operationSign: operation.sign,
					assignedUnits,
					assignedAlertGroups,
				},
				cmd.reqUser,
			),
		);
	}
}
