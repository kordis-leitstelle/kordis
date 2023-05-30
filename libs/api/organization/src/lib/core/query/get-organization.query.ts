import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { NotFoundException } from '@kordis/api/shared';

import { ImplOrganizationRepository } from '../../infra/repository/organization.repository';
import { Organization } from '../entity/organization.entity';
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
		private readonly repository: ImplOrganizationRepository,
	) {}

	async execute({ id }: GetOrganizationQuery): Promise<Organization> {
		const org = await this.repository.findById(id);

		if (!org) {
			throw new NotFoundException();
		}

		return org;
	}
}
