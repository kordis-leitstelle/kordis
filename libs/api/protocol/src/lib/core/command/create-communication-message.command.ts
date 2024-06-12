import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../entity/partials/producer-partial.entity';
import {
	RegisteredUnit,
	UnknownUnit,
} from '../entity/partials/unit-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../entity/protocol-entries/communication-message.entity';
import { ProtocolEntryCreatedEvent } from '../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';

export class CreateCommunicationMessageCommand {
	constructor(
		public readonly time: Date,
		public readonly sender: RegisteredUnit | UnknownUnit,
		public readonly recipient: RegisteredUnit | UnknownUnit,
		public readonly message: string,
		public readonly channel: string,
		public readonly requestUser: AuthUser,
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

		commMsg.validOrThrow();

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

	private createCommunicationMessageFromCommand({
		time,
		sender,
		recipient,
		message,
		channel,
		requestUser,
	}: CreateCommunicationMessageCommand): CommunicationMessage {
		const msgPayload = new CommunicationMessagePayload();
		msgPayload.message = message;

		const producer = new UserProducer();
		producer.userId = requestUser.id;
		producer.firstName = requestUser.firstName;
		producer.lastName = requestUser.lastName;

		const commMsg = new CommunicationMessage();
		commMsg.time = time;
		commMsg.sender = sender;
		commMsg.recipient = recipient;
		commMsg.payload = msgPayload;
		commMsg.producer = producer;
		commMsg.channel = channel;
		commMsg.searchableText = message;
		commMsg.orgId = requestUser.organizationId;

		return commMsg;
	}
}
