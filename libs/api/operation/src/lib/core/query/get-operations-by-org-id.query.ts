import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { OperationEntity } from '../entity/operation.entity';
import { OperationFilterDto } from '../repository/dto/operation-filter.dto';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';

export class GetOperationsByOrgIdQuery {
	constructor(
		readonly orgId: string,
		readonly filter?: Partial<OperationFilterDto>,
		readonly sortBySignDesc?: boolean,
	) {}
}

@QueryHandler(GetOperationsByOrgIdQuery)
export class GetOperationsByOrgIdHandler {
	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly repository: OperationRepository,
	) {}

	execute({
		orgId,
		filter,
		sortBySignDesc,
	}: GetOperationsByOrgIdQuery): Promise<OperationEntity[]> {
		return this.repository.findByOrgId(orgId, filter, sortBySignDesc);
	}
}
