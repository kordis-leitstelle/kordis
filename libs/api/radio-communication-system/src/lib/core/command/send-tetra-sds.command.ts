import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SdsNotAbleToSendException } from '../exception/sds-not-able-to-send.exception';
import { TETRA_SERVICE, TetraService } from '../service/tetra.service';

export class SendTetraSDSCommand {
	constructor(
		readonly issi: string,
		readonly message: string,
		readonly isFlash: boolean,
	) {}
}

@CommandHandler(SendTetraSDSCommand)
export class SendTetraSDSHandler
	implements ICommandHandler<SendTetraSDSCommand>
{
	constructor(
		@Inject(TETRA_SERVICE) private readonly tetraService: TetraService,
	) {}

	async execute(command: SendTetraSDSCommand): Promise<void> {
		try {
			await this.tetraService.sendSDS(
				command.issi,
				command.message,
				command.isFlash,
			);
		} catch (error) {
			throw new SdsNotAbleToSendException(error);
		}
	}
}
