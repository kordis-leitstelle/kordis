import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class GetUnitsByIdsQuery {
	constructor(readonly ids: string[]) {}
}

@QueryHandler(GetUnitsByIdsQuery)
export class GetUnitsByIdsHandler implements IQueryHandler<GetUnitsByIdsQuery> {
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({ ids }: GetUnitsByIdsQuery): Promise<UnitEntity[]> {
		return this.repository.findByIds(ids);
	}
}
