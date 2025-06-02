import { CommandBus } from '@nestjs/cqrs';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { OperationViewModel } from '@kordis/api/operation';
import { ProtocolMessageArgs } from '@kordis/api/protocol';
import {
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { LaunchCreateOngoingOperationProcessCommand } from '../../core/command/launch-create-ongoing-operation-process.command';
import { LaunchEndOperationProcessCommand } from '../../core/command/launch-end-operation-process.command';
import { CreateOngoingOperationInput } from './create-ongoing-operation.input';

@Resolver()
export class OperationManagerResolver {
	constructor(private readonly commandBus: CommandBus) {}

	@Mutation(() => OperationViewModel, {
		description: 'Starts a new ongoing operation with a protocol entry.',
	})
	async createOngoingOperation(
		@RequestUser() reqUser: AuthUser,
		@Args() { protocolMessage }: ProtocolMessageArgs,
		@Args('operation') operation: CreateOngoingOperationInput,
	): Promise<OperationViewModel> {
		try {
			return await this.commandBus.execute(
				new LaunchCreateOngoingOperationProcessCommand(
					reqUser,
					operation,
					protocolMessage ? await protocolMessage.asTransformedPayload() : null,
				),
			);
		} catch (error) {
			if (error instanceof ValidationException) {
				throw PresentableValidationException.fromCoreValidationException(
					'Die Einsatzdaten enthalten invalide Werte.',
					error,
				);
			}

			throw error;
		}
	}

	@Mutation(() => Boolean, {
		description: 'Ends an ongoing operation with a protocol entry.',
	})
	async endOngoingOperation(
		@RequestUser() reqUser: AuthUser,
		@Args('operationId', { type: () => ID }) operationId: string,
		@Args() { protocolMessage }: ProtocolMessageArgs,
	): Promise<boolean> {
		await this.commandBus.execute(
			new LaunchEndOperationProcessCommand(
				reqUser,
				operationId,
				protocolMessage ? await protocolMessage.asTransformedPayload() : null,
			),
		);

		return true;
	}
}
