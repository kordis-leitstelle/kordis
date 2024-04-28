import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class GetUnitByRCSIDQuery {
	constructor(
		readonly orgId: string,
		readonly rcsId: string,
	) {}
}

@QueryHandler(GetUnitByRCSIDQuery)
export class GetUnitByRCSIDHandler
	implements IQueryHandler<GetUnitByRCSIDQuery>
{
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({ orgId, rcsId }: GetUnitByRCSIDQuery): Promise<UnitEntity> {
		return this.repository.findByRcsId(orgId, rcsId);
	}
}
