import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../entity/partials/producer-partial.entity';
import { MessageUnit } from '../entity/partials/unit-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../entity/protocol-entries/communication-message.entity';
import { ProtocolEntryCreatedEvent } from '../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';
import { BaseCreateProtocolEntryCommand } from './base-create-protocol-entry.command';
import { setProtocolEntryBaseFromCommandHelper } from './helper/set-protocol-entry-base-from-command.helper';

export class CreateCommunicationMessageCommand
	implements BaseCreateProtocolEntryCommand
{
	constructor(
		readonly time: Date,
		readonly protocolData: {
			readonly sender: MessageUnit;
			readonly recipient: MessageUnit;
			readonly channel: string;
		},
		readonly message: string,
		readonly requestUser: AuthUser,
	) {}
}

@CommandHandler(CreateCommunicationMessageCommand)
export class CreateCommunicationMessageHandler
	implements ICommandHandler<CreateCommunicationMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateCommunicationMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		command: CreateCommunicationMessageCommand,
	): Promise<CommunicationMessage> {
		let commMsg = this.createCommunicationMessageFromCommand(command);

		await commMsg.validOrThrow();

		commMsg = await this.repository.create(commMsg);

		this.logger.log('Communication message created', { commMsgId: commMsg.id });

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(
				command.requestUser.organizationId,
				commMsg,
			),
		);

		return commMsg;
	}

	private createCommunicationMessageFromCommand(
		cmd: CreateCommunicationMessageCommand,
	): CommunicationMessage {
		const msgPayload = new CommunicationMessagePayload();
		msgPayload.message = cmd.message;

		const producer = new UserProducer();
		producer.userId = cmd.requestUser.id;
		producer.firstName = cmd.requestUser.firstName;
		producer.lastName = cmd.requestUser.lastName;

		const commMsg = new CommunicationMessage();
		setProtocolEntryBaseFromCommandHelper(cmd, commMsg);

		commMsg.payload = msgPayload;
		commMsg.searchableText = cmd.message;

		return commMsg;
	}
}
