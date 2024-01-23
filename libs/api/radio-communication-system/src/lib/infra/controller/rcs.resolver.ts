import { CommandBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SendTetraSDSCommand } from '../../core/command/send-tetra-sds.command';
import { SdsNotAbleToSendException } from '../../core/exception/sds-not-able-to-send.exception';
import { PresentableSdsNotSendException } from '../exception/presentable-sds-not-send.exception';

@Resolver()
export class RCSResolver {
	constructor(private readonly commandBus: CommandBus) {}

	@Mutation(() => Boolean)
	async sendSDS(
		@Args('issi') issi: string,
		@Args('message') message: string,
		@Args('isFlash') isFlash?: boolean,
	): Promise<boolean> {
		try {
			await this.commandBus.execute(
				new SendTetraSDSCommand(issi, message, !!isFlash),
			);
		} catch (error) {
			if (error instanceof SdsNotAbleToSendException) {
				throw new PresentableSdsNotSendException();
			}

			throw error;
		}

		return true;
	}
}
