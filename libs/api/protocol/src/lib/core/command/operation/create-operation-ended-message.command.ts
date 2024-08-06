import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationEndedMessage,
	OperationEndedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-ended-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../../repository/protocol-entry.repository';
import { BaseCreateMessageCommand } from '../base-create-message.command';
import { setProtocolMessageBaseFromCommandHelper } from '../helper/set-protocol-message-base-from-command.helper';

export class CreateOperationEndedMessageCommand
	implements BaseCreateMessageCommand
{
	constructor(
		readonly requestUser: AuthUser,
		readonly sender: MessageUnit,
		readonly recipient: MessageUnit,
		readonly channel: string,
		readonly time: Date,
		readonly operationData: {
			id: string;
			sign: string;
			alarmKeyword: string;
		},
	) {}
}

@CommandHandler(CreateOperationEndedMessageCommand)
export class CreateOperationEndedMessageHandler
	implements ICommandHandler<CreateOperationEndedMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOperationEndedMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		cmd: CreateOperationEndedMessageCommand,
	): Promise<OperationEndedMessage> {
		let msg = new OperationEndedMessage();
		setProtocolMessageBaseFromCommandHelper(cmd, msg);
		msg.searchableText = `einsatz ${cmd.operationData.alarmKeyword} ${cmd.operationData.sign} beendet`;
		msg.payload = this.getPayloadFromCommand(cmd);

		await msg.validOrThrow();

		msg = await this.repository.create(msg);

		this.logger.log('Operation ended message created', {
			msgId: msg.id,
		});

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(cmd.requestUser.organizationId, msg),
		);

		return msg;
	}

	private getPayloadFromCommand(
		cmd: CreateOperationEndedMessageCommand,
	): OperationEndedMessagePayload {
		const payload = new OperationEndedMessagePayload();
		payload.operationId = cmd.operationData.id;
		payload.operationSign = cmd.operationData.sign;

		return payload;
	}
}
