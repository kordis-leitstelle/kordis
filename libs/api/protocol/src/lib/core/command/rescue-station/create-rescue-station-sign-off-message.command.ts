import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import {
	RescueStationSignOffMessage,
	RescueStationSignOffMessagePayload,
} from '../../entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../../repository/protocol-entry.repository';
import { BaseCreateMessageCommand } from '../base-create-message.command';
import { setProtocolMessageBaseFromCommandHelper } from '../helper/set-protocol-message-base-from-command.helper';

export class CreateRescueStationSignOffMessageCommand
	implements BaseCreateMessageCommand
{
	constructor(
		readonly time: Date,
		readonly sender: MessageUnit,
		readonly recipient: MessageUnit,
		readonly rescueStation: {
			id: string;
			name: string;
			callSign: string;
		},
		readonly channel: string,
		readonly requestUser: AuthUser,
	) {}
}

@CommandHandler(CreateRescueStationSignOffMessageCommand)
export class CreateRescueStationSignOffMessageHandler
	implements ICommandHandler<CreateRescueStationSignOffMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateRescueStationSignOffMessageCommand.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		command: CreateRescueStationSignOffMessageCommand,
	): Promise<RescueStationSignOffMessage> {
		let msg = this.makeMessageFromCommand(command);

		await msg.validOrThrow();

		msg = await this.repository.create(msg);

		this.logger.log('Rescue station sign off message created', {
			commMsgId: msg.id,
		});

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(command.requestUser.organizationId, msg),
		);

		return msg;
	}

	private makeMessageFromCommand(
		cmd: CreateRescueStationSignOffMessageCommand,
	): RescueStationSignOffMessage {
		const msgPayload = new RescueStationSignOffMessagePayload();
		msgPayload.rescueStationId = cmd.rescueStation.id;
		msgPayload.rescueStationName = cmd.rescueStation.name;
		msgPayload.rescueStationCallSign = cmd.rescueStation.callSign;

		const msg = new RescueStationSignOffMessage();
		setProtocolMessageBaseFromCommandHelper(cmd, msg);

		msg.payload = msgPayload;
		msg.searchableText = `ausmeldung rettungswache ${cmd.rescueStation.name} ${cmd.rescueStation.callSign}`;

		return msg;
	}
}
