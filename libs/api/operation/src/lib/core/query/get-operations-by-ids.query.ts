import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RetainOrderOptions, RetainOrderService } from '@kordis/api/shared';

import { OperationEntity } from '../entity/operation.entity';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';

export class GetOperationsByIdsQuery {
	constructor(
		readonly ids: string[],
		readonly options: RetainOrderOptions = { retainOrder: false },
	) {}
}

@QueryHandler(GetOperationsByIdsQuery)
export class GetOperationByIdsQueryHandler
	implements IQueryHandler<GetOperationsByIdsQuery>
{
	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly operationRepository: OperationRepository,
		private readonly mutator: RetainOrderService,
	) {}

	async execute({
		ids,
		options,
	}: GetOperationsByIdsQuery): Promise<OperationEntity[]> {
		let operations = await this.operationRepository.findByIds(ids);
		operations = this.mutator.retainOrderIfEnabled(options, ids, operations);
		return operations;
	}
}
