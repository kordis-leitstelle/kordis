import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Ip,
	Logger,
	Post,
	Query,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TETRA_SERVICE } from '../../core/service/tetra.service';
import {
	TetraControlStatusPayload,
	TetraControlWebhookHandlers,
} from '../service/tetra-control.service';

@Controller('webhooks/tetra-control')
export class TetraControlWebhookController {
	private readonly logger = new Logger(TetraControlWebhookController.name);
	private readonly key: string;
	private readonly validIpAddresses?: ReadonlySet<string>;

	constructor(
		@Inject(TETRA_SERVICE)
		private readonly tetraControlService: TetraControlWebhookHandlers,
		config: ConfigService,
	) {
		this.key = config.getOrThrow<string>('TETRA_CONTROL_WEBHOOK_KEY');
		const validIpAddresses = config
			.get<string>('TETRA_CONTROL_WEBHOOK_VALID_IPS')
			?.split(',');
		if ((validIpAddresses?.length ?? 0) > 0) {
			this.validIpAddresses = Object.freeze(new Set<string>(validIpAddresses));
		}
	}

	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	async handleWebhook(
		@Body() payload: { data: { type: 'status' } },
		@Query('key') key: string,
		@Ip() ip: string,
	): Promise<void> {
		if (
			(this.validIpAddresses && !this.validIpAddresses.has(ip)) ||
			key !== this.key
		) {
			this.logger.warn('Unauthorized tetra control webhook request', {
				body: payload,
				key,
				ip,
			});
			throw new UnauthorizedException();
		}

		this.logger.log('Received tetra control webhook', { payload });

		switch (payload.data.type) {
			case 'status':
				await this.tetraControlService.handleStatusWebhook(
					payload as TetraControlStatusPayload,
				);
				break;
			default:
				throw new BadRequestException(
					`Tetra control ${payload.data.type} has no handler.`,
				);
		}
	}
}
