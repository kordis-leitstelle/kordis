import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class GetUnitByIdQuery {
	constructor(
		readonly orgId: string,
		readonly id: string,
	) {}
}

@QueryHandler(GetUnitByIdQuery)
export class GetUnitByIdHandler implements IQueryHandler<GetUnitByIdQuery> {
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({ orgId, id }: GetUnitByIdQuery): Promise<UnitEntity> {
		return this.repository.findById(orgId, id);
	}
}
