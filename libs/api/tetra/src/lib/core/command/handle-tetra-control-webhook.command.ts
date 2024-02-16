import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { NewTetraStatusEvent } from '../event/new-tetra-status.event';
import { UnhandledTetraControlWebhookTypeException } from '../exception/unhandled-tetra-control-webhook-type.exception';
import { UnknownTetraControlWebhookKeyException } from '../exception/unknown-tetra-control-webhook-key.exception';
import { TetraControlStatusPayload } from '../model/tetra-control-status-payload.model';
import {
	TETRA_CONFIG_REPOSITORY,
	TetraConfigRepository,
} from '../repository/tetra-config.repository';
import { TETRA_SERVICE, TetraService } from '../service/tetra.service';

export class HandleTetraControlWebhookCommand {
	constructor(
		readonly payload: TetraControlStatusPayload,
		readonly key: string,
	) {}
}

@CommandHandler(HandleTetraControlWebhookCommand)
export class HandleTetraControlWebhookHandler
	implements ICommandHandler<HandleTetraControlWebhookCommand>
{
	constructor(
		@Inject(TETRA_SERVICE) private readonly tetraService: TetraService,
		@Inject(TETRA_CONFIG_REPOSITORY)
		private readonly tetraConfigRepository: TetraConfigRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		payload,
		key,
	}: HandleTetraControlWebhookCommand): Promise<void> {
		const tetraConfig =
			await this.tetraConfigRepository.findByWebhookAccessKey(key);
		if (!tetraConfig) {
			throw new UnknownTetraControlWebhookKeyException();
		}

		switch (payload.data.type) {
			case 'status':
				this.eventBus.publish(
					new NewTetraStatusEvent(
						tetraConfig.orgId,
						payload.sender,
						parseInt(payload.data.status),
						this.getSanitizedTimestamp(payload.timestamp),
						'tetracontrol',
					),
				);
				break;
			default:
				throw new UnhandledTetraControlWebhookTypeException(payload.data.type);
		}
	}

	private getSanitizedTimestamp(timestamp: string): Date {
		const parsedTimestamp = /\/Date\((-?\d+)\)\//.exec(timestamp);
		if (parsedTimestamp && parsedTimestamp.length > 1) {
			return new Date(parseInt(parsedTimestamp[1]));
		}

		return new Date();
	}
}
