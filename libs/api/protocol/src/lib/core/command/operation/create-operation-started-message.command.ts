import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationStartedMessage,
	OperationStartedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-started-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../../repository/protocol-entry.repository';
import { BaseCreateMessageCommand } from '../base-create-message.command';
import {
	AssignedAlertGroup,
	AssignedUnit,
	generateSearchableAssignmentsText,
	setAssignmentsOnPayload,
} from '../helper/message-assignments.helper';
import { setProtocolMessageBaseFromCommandHelper } from '../helper/set-protocol-message-base-from-command.helper';

export class CreateOperationStartedMessageCommand
	implements BaseCreateMessageCommand
{
	readonly time: Date;

	constructor(
		readonly sender: MessageUnit,
		readonly recipient: MessageUnit,
		readonly channel: string,
		readonly operationData: {
			id: string;
			sign: string;
			alarmKeyword: string;
			start: Date;
			location: {
				name: string;
				street: string;
				city: string;
				postalCode: string;
			};
			assignedUnits: AssignedUnit[];
			assignedAlertGroups: AssignedAlertGroup[];
		},
		readonly requestUser: AuthUser,
	) {
		this.time = operationData.start;
	}
}

@CommandHandler(CreateOperationStartedMessageCommand)
export class CreateOperationStartedMessageHandler
	implements ICommandHandler<CreateOperationStartedMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOperationStartedMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: CreateOperationStartedMessageCommand): Promise<void> {
		let msg = new OperationStartedMessage();
		setProtocolMessageBaseFromCommandHelper(cmd, msg);
		msg.payload = this.getPayloadFromCommand(cmd.operationData);
		msg.searchableText = this.generateSearchableText(cmd.operationData);
		await msg.validOrThrow();

		msg = await this.repository.create(msg);

		this.logger.log('Operation started message created', {
			msgId: msg.id,
		});

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(cmd.requestUser.organizationId, msg),
		);
	}

	private getPayloadFromCommand(
		operationData: CreateOperationStartedMessageCommand['operationData'],
	): OperationStartedMessagePayload {
		const payload = new OperationStartedMessagePayload();
		payload.operationId = operationData.id;
		payload.start = operationData.start;
		payload.operationSign = operationData.sign;
		payload.location = operationData.location;
		setAssignmentsOnPayload(
			operationData.assignedUnits,
			operationData.assignedAlertGroups,
			payload,
		);

		return payload;
	}

	private generateSearchableText(
		operationData: CreateOperationStartedMessageCommand['operationData'],
	): string {
		const assignmentsStr = generateSearchableAssignmentsText(
			operationData.assignedUnits,
			operationData.assignedAlertGroups,
		);

		return `einsatz ${operationData.alarmKeyword} ${operationData.sign} gestartet ${assignmentsStr}`;
	}
}
