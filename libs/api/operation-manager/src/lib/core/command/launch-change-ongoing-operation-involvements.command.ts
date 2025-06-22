import {
	CommandBus,
	CommandHandler,
	ICommandHandler,
	QueryBus,
} from '@nestjs/cqrs';

import {
	GetOperationByIdQuery,
	OperationViewModel,
	UpdateOngoingOperationInvolvementsCommand,
} from '@kordis/api/operation';
import {
	CreateOperationInvolvementsUpdatedMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { UnitsPopulateService } from '../service/units-populate.service';

export class LaunchChangeOngoingOperationInvolvementsCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly involvements: {
			readonly assignedUnitIds: string[];
			readonly assignedAlertGroups: {
				alertGroupId: string;
				assignedUnitIds: string[];
			}[];
		},
		readonly protocolData: {
			readonly sender: MessageUnit;
			readonly recipient: MessageUnit;
			readonly channel: string;
		} | null,
		readonly reqUser: AuthUser,
	) {}
}

@CommandHandler(LaunchChangeOngoingOperationInvolvementsCommand)
export class LaunchChangeOngoingOperationInvolvementsHandler
	implements ICommandHandler<LaunchChangeOngoingOperationInvolvementsCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly popService: UnitsPopulateService,
	) {}

	async execute(
		command: LaunchChangeOngoingOperationInvolvementsCommand,
	): Promise<void> {
		const operation: OperationViewModel = await this.queryBus.execute(
			new GetOperationByIdQuery(command.orgId, command.operationId),
		);

		const { assignedUnits, assignedAlertGroups } =
			await this.popService.getPopulatedUnitsAndAlertGroups(
				operation.unitInvolvements.map(
					(unitInvolvement) => unitInvolvement.unit.id,
				),
				operation.alertGroupInvolvements.map((alertGroupInvolvement) => ({
					alertGroupId: alertGroupInvolvement.alertGroup.id,
					assignedUnitIds: alertGroupInvolvement.unitInvolvements.map(
						(unitInvolvement) => unitInvolvement.unit.id,
					),
				})),
			);

		await this.commandBus.execute(
			new UpdateOngoingOperationInvolvementsCommand(
				command.orgId,
				command.operationId,
				command.involvements.assignedUnitIds,
				command.involvements.assignedAlertGroups,
			),
		);

		await this.commandBus.execute(
			new CreateOperationInvolvementsUpdatedMessageCommand(
				new Date(),
				command.protocolData,
				{
					operationId: operation.id,
					operationSign: operation.sign,
					assignedUnits,
					assignedAlertGroups,
				},
				command.reqUser,
			),
		);
	}
}
