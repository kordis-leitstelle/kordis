import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class GetUnitsByOrgQuery {
	constructor(readonly orgId: string) {}
}

@QueryHandler(GetUnitsByOrgQuery)
export class GetUnitsByOrgHandler implements IQueryHandler<GetUnitsByOrgQuery> {
	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
	) {}

	async execute({ orgId }: GetUnitsByOrgQuery): Promise<UnitEntity[]> {
		return this.repository.findByOrg(orgId);
	}
}
