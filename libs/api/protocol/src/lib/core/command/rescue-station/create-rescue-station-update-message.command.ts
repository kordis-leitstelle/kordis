import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import { RescueStationUpdateMessage } from '../../entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../../repository/protocol-entry.repository';
import { BaseCreateMessageCommand } from '../base-create-message.command';
import { RescueStationMessageFactory } from '../helper/rescue-station-message.factory';
import { RescueStationMessageDetails } from './message-command-rescue-station-details.model';

export class CreateRescueStationUpdateMessageCommand
	implements BaseCreateMessageCommand
{
	constructor(
		readonly time: Date,
		readonly sender: MessageUnit,
		readonly recipient: MessageUnit,
		readonly rescueStation: RescueStationMessageDetails,
		readonly channel: string,
		readonly requestUser: AuthUser,
	) {}
}

@CommandHandler(CreateRescueStationUpdateMessageCommand)
export class CreateRescueStationUpdateMessageHandler
	implements ICommandHandler<CreateRescueStationUpdateMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateRescueStationUpdateMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
		private readonly rescueStationMessageFactory: RescueStationMessageFactory,
	) {}

	async execute(
		cmd: CreateRescueStationUpdateMessageCommand,
	): Promise<RescueStationUpdateMessage> {
		let msg =
			await this.rescueStationMessageFactory.createUpdateMessageFromCommand(
				cmd,
			);

		await msg.validOrThrow();

		msg = await this.repository.create(msg);

		this.logger.log('Rescue station update message created', {
			msgId: msg.id,
		});

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(cmd.requestUser.organizationId, msg),
		);

		return msg;
	}
}
