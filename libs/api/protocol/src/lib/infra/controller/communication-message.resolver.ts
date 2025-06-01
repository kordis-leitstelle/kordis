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
import { BaseCreateMessageArgs } from './base-create-message.args';

@Resolver()
export class CommunicationMessageResolver {
	constructor(private readonly commandBus: CommandBus) {}

	@Mutation(() => CommunicationMessage)
	async createCommunicationMessage(
		@RequestUser() reqUser: AuthUser,
		@Args()
		baseCreateMessageArgs: BaseCreateMessageArgs,
		@Args('message') message: string,
	): Promise<CommunicationMessage> {
		try {
			return await this.commandBus.execute(
				new CreateCommunicationMessageCommand(
					new Date(),
					await baseCreateMessageArgs.asTransformedPayload(),
					message,
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
