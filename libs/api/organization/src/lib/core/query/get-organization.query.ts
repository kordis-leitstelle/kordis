import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OrganizationEntity } from '../entity/organization.entity';
import { OrganizationNotFoundException } from '../exceptions/organization-not-found.exception';
import {
	ORGANIZATION_REPOSITORY,
	OrganizationRepository,
} from '../repository/organization.repository';

export class GetOrganizationQuery {
	constructor(public readonly id: string) {}
}

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler
	implements IQueryHandler<GetOrganizationQuery>
{
	constructor(
		@Inject(ORGANIZATION_REPOSITORY)
		private readonly repository: OrganizationRepository,
	) {}

	async execute({ id }: GetOrganizationQuery): Promise<OrganizationEntity> {
		const org = await this.repository.findById(id);

		if (!org) {
			throw new OrganizationNotFoundException(id);
		}
		return org;
	}
}
