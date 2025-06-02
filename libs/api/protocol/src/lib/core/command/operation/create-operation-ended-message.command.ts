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
import { BaseCreateProtocolEntryCommand } from '../base-create-protocol-entry.command';
import { setProtocolEntryBaseFromCommandHelper } from '../helper/set-protocol-entry-base-from-command.helper';

export class CreateOperationEndedMessageCommand
	implements BaseCreateProtocolEntryCommand
{
	constructor(
		readonly requestUser: AuthUser,
		readonly protocolData: {
			readonly sender: MessageUnit;
			readonly recipient: MessageUnit;
			readonly channel: string;
		} | null,
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

	async execute(cmd: CreateOperationEndedMessageCommand): Promise<void> {
		let msg = new OperationEndedMessage();
		setProtocolEntryBaseFromCommandHelper(cmd, msg);

		msg.referenceId = cmd.operationData.id;
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
