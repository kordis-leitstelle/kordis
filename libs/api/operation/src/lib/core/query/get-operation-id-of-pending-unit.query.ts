import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';

export class GetOperationIdOfPendingUnitQuery {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
	) {}
}

@QueryHandler(GetOperationIdOfPendingUnitQuery)
export class GetOperationIdOfPendingUnitHandler
	implements IQueryHandler<GetOperationIdOfPendingUnitQuery>
{
	constructor(
		@Inject(OPERATION_INVOLVEMENT_REPOSITORY)
		private readonly repository: OperationInvolvementsRepository,
	) {}

	async execute({
		orgId,
		unitId,
	}: GetOperationIdOfPendingUnitQuery): Promise<string | undefined> {
		const involvement = await this.repository.findInvolvementOfPendingUnit(
			orgId,
			unitId,
		);
		return involvement?.operationId;
	}
}
