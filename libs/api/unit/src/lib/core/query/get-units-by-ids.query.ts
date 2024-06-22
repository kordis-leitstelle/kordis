import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RetainOrderMutator, RetainOrderOptions } from '@kordis/api/shared';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class GetUnitsByIdsQuery {
	constructor(
		readonly ids: string[],
		readonly options: RetainOrderOptions = { retainOrder: false },
	) {}
}

@QueryHandler(GetUnitsByIdsQuery)
export class GetUnitsByIdsHandler implements IQueryHandler<GetUnitsByIdsQuery> {
	private readonly mutator = new RetainOrderMutator('units');

	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({ ids, options }: GetUnitsByIdsQuery): Promise<UnitEntity[]> {
		let units = await this.repository.findByIds(ids);

		units = this.mutator.retainOrderIfEnabled(options, ids, units);

		return units;
	}
}
