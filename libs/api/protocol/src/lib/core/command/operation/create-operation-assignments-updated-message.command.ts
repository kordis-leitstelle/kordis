import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationAssignmentsUpdatedMessage,
	OperationAssignmentsUpdatedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-involvements-updated-message.entity';
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

export class CreateOperationAssignmentsUpdatedMessageCommand
	implements BaseCreateMessageCommand
{
	constructor(
		readonly sender: MessageUnit,
		readonly recipient: MessageUnit,
		readonly channel: string,
		readonly time: Date,
		readonly assignmentsData: {
			operationId: string;
			operationSign: string;
			assignedUnits: AssignedUnit[];
			assignedAlertGroups: AssignedAlertGroup[];
		},
		readonly requestUser: AuthUser,
	) {}
}

@CommandHandler(CreateOperationAssignmentsUpdatedMessageCommand)
export class CreateOperationAssignmentsUpdatedMessageHandler
	implements ICommandHandler<CreateOperationAssignmentsUpdatedMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOperationAssignmentsUpdatedMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		cmd: CreateOperationAssignmentsUpdatedMessageCommand,
	): Promise<void> {
		let msg = new OperationAssignmentsUpdatedMessage();
		setProtocolMessageBaseFromCommandHelper(cmd, msg);
		msg.payload = this.getPayloadFromCommand(cmd);
		msg.searchableText = this.generateSearchableText(cmd.assignmentsData);
		await msg.validOrThrow();

		msg = await this.repository.create(msg);

		this.logger.log('Operation involvements changed message created', {
			msgId: msg.id,
		});

		this.eventBus.publish(
			new ProtocolEntryCreatedEvent(cmd.requestUser.organizationId, msg),
		);
	}

	private getPayloadFromCommand({
		assignmentsData,
	}: CreateOperationAssignmentsUpdatedMessageCommand): OperationAssignmentsUpdatedMessagePayload {
		const payload = new OperationAssignmentsUpdatedMessagePayload();
		payload.operationId = assignmentsData.operationId;
		payload.operationSign = assignmentsData.operationSign;
		setAssignmentsOnPayload(
			assignmentsData.assignedUnits,
			assignmentsData.assignedAlertGroups,
			payload,
		);
		return payload;
	}

	private generateSearchableText(
		assignmentsData: CreateOperationAssignmentsUpdatedMessageCommand['assignmentsData'],
	): string {
		const assignmentsStr = generateSearchableAssignmentsText(
			assignmentsData.assignedUnits,
			assignmentsData.assignedAlertGroups,
		);

		return `einsatz ${assignmentsData.operationSign} zuordnungen geändert einheiten ${assignmentsStr}`;
	}
}
