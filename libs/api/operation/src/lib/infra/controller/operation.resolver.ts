import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { CreateOperationCommand } from '../../core/command/create-operation.command';
import { Operation } from '../../core/entity/operation.entity';

@Resolver()
export class OperationResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Mutation(() => Operation)
	async createOperation(
		@RequestUser() { organizationId }: AuthUser,
		@Args('start') start: Date,
		@Args('end', { nullable: true }) end?: Date,
	): Promise<Operation> {
		try {
			return await this.commandBus.execute(
				new CreateOperationCommand(organizationId, start, end),
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
}
