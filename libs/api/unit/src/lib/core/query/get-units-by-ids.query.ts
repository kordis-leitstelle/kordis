import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RetainOrderOptions, RetainOrderService } from '@kordis/api/shared';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class GetUnitsByIdsQuery {
	constructor(
		readonly ids: string[],
		readonly orgId?: string,
		readonly options: RetainOrderOptions = { retainOrder: false },
	) {}
}

@QueryHandler(GetUnitsByIdsQuery)
export class GetUnitsByIdsHandler implements IQueryHandler<GetUnitsByIdsQuery> {
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
		private readonly mutator: RetainOrderService,
	) {}

	async execute({
		ids,
		orgId,
		options,
	}: GetUnitsByIdsQuery): Promise<UnitEntity[]> {
		let units = await this.repository.findByIds(ids, orgId);

		units = this.mutator.retainOrderIfEnabled(options, ids, units);

		return units;
	}
}
