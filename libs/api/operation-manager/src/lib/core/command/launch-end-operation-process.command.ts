import { CommandBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';

import {
	EndOngoingOperationCommand,
	GetOperationByIdQuery,
	OperationViewModel,
} from '@kordis/api/operation';
import {
	CreateOperationEndedMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

export class LaunchEndOperationProcessCommand {
	constructor(
		readonly requestUser: AuthUser,
		readonly operationId: string,
		readonly protocolMessageData: {
			sender: MessageUnit;
			recipient: MessageUnit;
			channel: string;
		},
	) {}
}

export class LaunchEndOperationProcessHandler
	implements ICommandHandler<LaunchEndOperationProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	async execute({
		operationId,
		protocolMessageData,
		requestUser,
	}: LaunchEndOperationProcessCommand): Promise<void> {
		await this.commandBus.execute(
			new EndOngoingOperationCommand(
				requestUser.organizationId,
				operationId,
				new Date(),
			),
		);

		const operation: OperationViewModel = await this.queryBus.execute(
			new GetOperationByIdQuery(requestUser.organizationId, operationId),
		);

		await this.commandBus.execute(
			new CreateOperationEndedMessageCommand(
				requestUser,
				protocolMessageData.sender,
				protocolMessageData.recipient,
				protocolMessageData.channel,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				operation.end!,
				operation,
			),
		);
	}
}
