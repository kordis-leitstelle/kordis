import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { OperationViewModel } from '@kordis/api/operation';
import { BaseCreateMessageArgs } from '@kordis/api/protocol';
import {
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { LaunchCreateOperationProcessCommand } from '../../core/command/launch-create-operation-process.command';
import { LaunchEndOperationProcessCommand } from '../../core/command/launch-end-operation-process.command';
import { LaunchUpdateOngoingInvolvementsProcessCommand } from '../../core/command/launch-update-ongoing-involvements-process.command';
import { CreateOngoingOperationArgs } from './create-ongoing-operation.args';
import { UpdateOngoingAssignmentsInput } from './update-ongoing-involvements.args';


@Resolver()
export class OperationManagerResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Mutation(() => OperationViewModel, {
		description: 'Starts a new ongoing operation with a protocol entry.',
	})
	async createOngoingOperation(
		@RequestUser() reqUser: AuthUser,
		@Args('operation') operation: CreateOngoingOperationArgs,
		@Args('protocol') protocolMessageData: BaseCreateMessageArgs,
	): Promise<OperationViewModel> {
		try {
			return await this.commandBus.execute(
				new LaunchCreateOperationProcessCommand(
					reqUser,
					operation,
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

	@Mutation(() => OperationViewModel)
	async updateOngoingOperationInvolvements(
		@RequestUser() reqUser: AuthUser,
		@Args('operationId') operationId: string,
		@Args('assignmentsData') assignmentsData: UpdateOngoingAssignmentsInput,
		@Args('protocolMessageData') protocolMessageData: BaseCreateMessageArgs,
	): Promise<OperationViewModel> {
		return this.commandBus.execute(
			new LaunchUpdateOngoingInvolvementsProcessCommand(
				reqUser,
				operationId,
				assignmentsData,
				await protocolMessageData.asTransformedPayload(),
			),
		);
	}

	@Mutation(() => OperationViewModel)
	async endOngoingOperation(
		@RequestUser() reqUser: AuthUser,
		@Args('operationId') operationId: string,
		@Args('protocolMessageData') protocolMessageData: BaseCreateMessageArgs,
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
