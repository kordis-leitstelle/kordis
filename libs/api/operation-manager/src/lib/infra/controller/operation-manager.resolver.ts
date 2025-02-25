import { CommandBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { OperationViewModel } from '@kordis/api/operation';
import { BaseCreateMessageArgs } from '@kordis/api/protocol';
import {
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { LaunchCreateOngoingOperationProcessCommand } from '../../core/command/launch-create-ongoing-operation-process.command';
import { LaunchEndOperationProcessCommand } from '../../core/command/launch-end-operation-process.command';
import { CreateOngoingOperationArgs } from './create-ongoing-operation.args';

@Resolver()
export class OperationManagerResolver {
	constructor(private readonly commandBus: CommandBus) {}

	@Mutation(() => OperationViewModel, {
		description: 'Starts a new ongoing operation with a protocol entry.',
	})
	async createOngoingOperation(
		@RequestUser() reqUser: AuthUser,
		@Args('operation') operationData: CreateOngoingOperationArgs,
		@Args('protocolMessage') protocolMessageData: BaseCreateMessageArgs,
	): Promise<OperationViewModel> {
		try {
			return await this.commandBus.execute(
				new LaunchCreateOngoingOperationProcessCommand(
					reqUser,
					operationData,
					await protocolMessageData.asTransformedPayload(),
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

	@Mutation(() => OperationViewModel, {
		description: 'Ends an ongoing operation with a protocol entry.tet',
	})
	async endOngoingOperation(
		@RequestUser() reqUser: AuthUser,
		@Args('operationId') operationId: string,
		@Args('protocolMessage') protocolMessageData: BaseCreateMessageArgs,
	): Promise<OperationViewModel> {
		return this.commandBus.execute(
			new LaunchEndOperationProcessCommand(
				reqUser,
				operationId,
				await protocolMessageData.asTransformedPayload(),
			),
		);
	}
}
