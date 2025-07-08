import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { CreateAlertForOperationCommand } from '@kordis/api/alerting';
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
import { AlertFailedError } from '../exception/alert-failed.error';
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
		readonly alertData: {
			alertGroupIds: string[];
			description: string;
			hasPriority: boolean;
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
		requestUser,
		protocolData,
		alertData,
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

		if (alertData) {
			try {
				await this.commandBus.execute(
					new CreateAlertForOperationCommand(
						alertData.alertGroupIds,
						alertData.description,
						operation,
						alertData.hasPriority,
						requestUser.organizationId,
					),
				);
			} catch {
				throw new AlertFailedError();
			}
		}

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
