import { Inject } from '@nestjs/common';
import type { IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';

import type { Organization } from '../entity/organization.entity';
import { OrganizationNotFoundException } from '../exceptions/organization-not-found.exception';
import type { OrganizationRepository } from '../repository/organization.repository';
import { ORGANIZATION_REPOSITORY } from '../repository/organization.repository';

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

	async execute({ id }: GetOrganizationQuery): Promise<Organization> {
		const org = await this.repository.findById(id);

		if (!org) {
			throw new OrganizationNotFoundException(id);
		}

		return org;
	}
}
