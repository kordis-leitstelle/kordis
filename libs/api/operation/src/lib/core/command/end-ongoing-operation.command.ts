import {
	CommandBus,
	CommandHandler,
	ICommandHandler,
	QueryBus,
} from '@nestjs/cqrs';

import { OperationViewModel } from '../../infra/operation.view-model';
import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationNotOngoingException } from '../exceptions/operation-not-ongoing.exception';
import { GetOperationByIdQuery } from '../query/get-operation-by-id.query';
import { UpdateOperationBaseDataCommand } from './update-operation-base-data.command';

export class EndOngoingOperationCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly end: Date,
	) {}
}

@CommandHandler(EndOngoingOperationCommand)
export class EndOngoingOperationHandler
	implements ICommandHandler<EndOngoingOperationCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	async execute({
		orgId,
		operationId,
		end,
	}: EndOngoingOperationCommand): Promise<void> {
		const operation: OperationViewModel = await this.queryBus.execute(
			new GetOperationByIdQuery(orgId, operationId),
		);

		if (operation.processState !== OperationProcessState.ON_GOING) {
			throw new OperationNotOngoingException();
		}

		await this.commandBus.execute(
			new UpdateOperationBaseDataCommand(orgId, operationId, {
				end,
				processState: OperationProcessState.COMPLETED,
			}),
		);
	}
}
