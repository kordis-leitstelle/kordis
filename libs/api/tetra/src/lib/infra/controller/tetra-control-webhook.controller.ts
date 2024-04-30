import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Ip,
	Logger,
	Post,
	Query,
	UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { KordisLogger } from '@kordis/api/observability';

import { HandleTetraControlWebhookCommand } from '../../core/command/handle-tetra-control-webhook.command';
import { UnhandledTetraControlWebhookTypeException } from '../../core/exception/unhandled-tetra-control-webhook-type.exception';
import { UnknownTetraControlWebhookKeyException } from '../../core/exception/unknown-tetra-control-webhook-key.exception';
import { TetraControlStatusPayload } from '../../core/model/tetra-control-status-payload.model';

@Controller('webhooks/tetra-control')
export class TetraControlWebhookController {
	private readonly logger: KordisLogger = new Logger(
		TetraControlWebhookController.name,
	);

	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	async handleWebhook(
		@Body() payload: TetraControlStatusPayload,
		@Query('key') key: string,
		@Ip() ip: string,
	): Promise<{ success: true }> {
		this.logger.log('Received tetra control webhook', { payload });

		try {
			await this.commandBus.execute(
				new HandleTetraControlWebhookCommand(payload, key),
			);
		} catch (error: unknown) {
			if (error instanceof UnhandledTetraControlWebhookTypeException) {
				this.logger.warn('Unhandled tetra control webhook type', error);
				throw new BadRequestException('Unhandled tetra control webhook type');
			} else if (error instanceof UnknownTetraControlWebhookKeyException) {
				this.logger.warn('Unknown tetra control webhook key', {
					key,
					ip,
					payload,
				});
				throw new UnauthorizedException();
			}

			throw error;
		}

		return {
			success: true,
		};
	}
}
