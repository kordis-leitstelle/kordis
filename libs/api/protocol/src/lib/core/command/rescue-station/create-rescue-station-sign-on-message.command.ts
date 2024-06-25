import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import { RescueStationSignOnMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../../repository/protocol-entry.repository';
import { BaseCreateMessageCommand } from '../base-create-message.command';
import { RescueStationMessageFactory } from '../helper/rescue-station-message.factory';
import { MessageCommandRescueStationDetails } from './message-command-rescue-station-details.model';

export class CreateRescueStationSignOnMessageCommand
	implements BaseCreateMessageCommand
{
	constructor(
		readonly time: Date,
		readonly sender: MessageUnit,
		readonly recipient: MessageUnit,
		readonly rescueStation: MessageCommandRescueStationDetails,
		readonly channel: string,
		readonly requestUser: AuthUser,
	) {}
}

@CommandHandler(CreateRescueStationSignOnMessageCommand)
export class CreateRescueStationSignOnMessageHandler
	implements ICommandHandler<CreateRescueStationSignOnMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateRescueStationSignOnMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
		private readonly rescueStationMessageFactory: RescueStationMessageFactory,
	) {}

	async execute(
		cmd: CreateRescueStationSignOnMessageCommand,
	): Promise<RescueStationSignOnMessage> {
		let msg =
			await this.rescueStationMessageFactory.createSignOnMessageFromCommand(
				cmd,
			);

		await msg.validOrThrow();

		msg = await this.repository.create(msg);

		this.logger.log('Rescue station sign on message created', {
			msgId: msg.id,
		});

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(cmd.requestUser.organizationId, msg),
		);

		return msg;
	}
}
