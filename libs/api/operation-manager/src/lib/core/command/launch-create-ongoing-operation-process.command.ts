import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import {
	CreateOperationCommand,
	OperationViewModel,
} from '@kordis/api/operation';
import {
	CreateOperationStartedMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { OngoingOperationCreatedEvent } from '../event/ongoing-operation-created.event';
import { UnitsPopulateService } from '../service/units-populate.service';

export class LaunchCreateOngoingOperationProcessCommand {
	constructor(
		readonly requestUser: AuthUser,
		readonly operationData: {
			start: Date;
			alarmKeyword: string;
			location: {
				address: {
					name: string;
					street: string;
					postalCode: string;
					city: string;
				};
				coordinate: {
					lat: number;
					lon: number;
				} | null;
			};
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
		} | null,
	) {}
}

@CommandHandler(LaunchCreateOngoingOperationProcessCommand)
export class LaunchCreateOngoingOperationProcessHandler
	implements ICommandHandler<LaunchCreateOngoingOperationProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly unitsPopulateService: UnitsPopulateService,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		operationData,
		protocolData,
		requestUser,
	}: LaunchCreateOngoingOperationProcessCommand): Promise<OperationViewModel> {
		const operation: OperationViewModel = await this.commandBus.execute(
			new CreateOperationCommand(
				requestUser,
				operationData.start,
				null,
				operationData.location,
				operationData.alarmKeyword,
				operationData.assignedUnitIds,
				operationData.assignedAlertGroups,
			),
		);

		this.eventBus.publish(
			new OngoingOperationCreatedEvent(requestUser.organizationId, operation),
		);

		const { assignedUnits, assignedAlertGroups } =
			await this.unitsPopulateService.getPopulatedUnitsAndAlertGroups(
				operationData.assignedUnitIds,
				operationData.assignedAlertGroups,
			);
		await this.commandBus.execute(
			new CreateOperationStartedMessageCommand(
				protocolData,
				{
					id: operation.id,
					sign: operation.sign,
					alarmKeyword: operation.alarmKeyword,
					start: operation.start,
					location: operation.location.address,
					assignedUnits,
					assignedAlertGroups,
				},
				requestUser,
			),
		);

		return operation;
	}
}
