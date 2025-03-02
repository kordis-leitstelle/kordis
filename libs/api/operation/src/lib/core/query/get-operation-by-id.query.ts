import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OperationEntity } from '../entity/operation.entity';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';

export class GetOperationByIdQuery {
	constructor(
		readonly orgId: string,
		readonly id: string,
	) {}
}

@QueryHandler(GetOperationByIdQuery)
export class GetOperationByIdHandler
	implements IQueryHandler<GetOperationByIdQuery>
{
	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly repository: OperationRepository,
	) {}

	execute({ orgId, id }: GetOperationByIdQuery): Promise<OperationEntity> {
		return this.repository.findById(orgId, id);
	}
}
