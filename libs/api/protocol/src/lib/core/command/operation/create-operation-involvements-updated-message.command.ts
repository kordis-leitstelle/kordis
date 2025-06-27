import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { AuthUser } from '@kordis/shared/model';

import { MessageUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationInvolvementsUpdatedMessage,
	OperationInvolvementsUpdatedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-involvements-updated-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../../repository/protocol-entry.repository';
import { BaseCreateProtocolEntryCommand } from '../base-create-protocol-entry.command';
import {
	AssignedAlertGroup,
	AssignedUnit,
	generateSearchableAssignmentsText,
	setAssignmentsOnPayload,
} from '../helper/message-assignments.helper';
import { setProtocolEntryBaseFromCommandHelper } from '../helper/set-protocol-entry-base-from-command.helper';

export class CreateOperationInvolvementsUpdatedMessageCommand
	implements BaseCreateProtocolEntryCommand
{
	constructor(
		readonly time: Date,
		readonly protocolData: {
			readonly sender: MessageUnit;
			readonly recipient: MessageUnit;
			readonly channel: string;
		} | null,
		readonly assignmentsData: {
			operationId: string;
			operationSign: string;
			assignedUnits: AssignedUnit[];
			assignedAlertGroups: AssignedAlertGroup[];
		},
		readonly requestUser: AuthUser,
	) {}
}

@CommandHandler(CreateOperationInvolvementsUpdatedMessageCommand)
export class CreateOperationInvolvementsUpdatedMessageHandler
	implements ICommandHandler<CreateOperationInvolvementsUpdatedMessageCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOperationInvolvementsUpdatedMessageHandler.name,
	);

	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		cmd: CreateOperationInvolvementsUpdatedMessageCommand,
	): Promise<void> {
		let msg = new OperationInvolvementsUpdatedMessage();
		setProtocolEntryBaseFromCommandHelper(cmd, msg);
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
	}: CreateOperationInvolvementsUpdatedMessageCommand): OperationInvolvementsUpdatedMessagePayload {
		const payload = new OperationInvolvementsUpdatedMessagePayload();
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
		assignmentsData: CreateOperationInvolvementsUpdatedMessageCommand['assignmentsData'],
	): string {
		const assignmentsStr = generateSearchableAssignmentsText(
			assignmentsData.assignedUnits,
			assignmentsData.assignedAlertGroups,
		);

		return `einsatz ${assignmentsData.operationSign} zuordnungen geändert einheiten ${assignmentsStr}`;
	}
}
