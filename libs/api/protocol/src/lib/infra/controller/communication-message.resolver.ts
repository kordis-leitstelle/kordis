import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { CreateCommunicationMessageCommand } from '../../core/command/create-communication-message.command';
import { CommunicationMessage } from '../../core/entity/protocol-entries/communication-message.entity';
import { UnitInputTransformer } from '../service/unit-input.transformer';
import { UnitInput } from '../view-model/unit-input.view-model';

@Resolver()
export class CommunicationMessageResolver {
	constructor(private readonly commandBus: CommandBus) {}

	@Mutation(() => CommunicationMessage)
	@UsePipes(new ValidationPipe({ transform: true }))
	async createCommunicationMessage(
		@RequestUser() reqUser: AuthUser,
		@Args('sender', { type: () => UnitInput }) sender: UnitInput,
		@Args('recipient', { type: () => UnitInput }) recipient: UnitInput,
		@Args('message') message: string,
		@Args('channel') channel: string,
	): Promise<CommunicationMessage> {
		try {
			return await this.commandBus.execute(
				new CreateCommunicationMessageCommand(
					new Date(),
					await UnitInputTransformer.transform(sender),
					await UnitInputTransformer.transform(recipient),
					message,
					channel,
					reqUser,
				),
			);
		} catch (error) {
			if (error instanceof ValidationException) {
				throw PresentableValidationException.fromCoreValidationException(
					'Das Funkgespräch enthält ungültige Parameter.',
					error,
				);
			}

			throw error;
		}
	}
}
