import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	PresentableNotFoundException,
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';

import { CreateOrganizationCommand } from '../../core/command/create-organization.command';
import { UpdateOrganizationGeoSettingsCommand } from '../../core/command/update-organization-geo-settings.command';
import {
	Organization,
	OrganizationGeoSettings,
} from '../../core/entity/organization.entity';
import { OrganizationNotFoundException } from '../../core/exceptions/organization-not-found.exception';
import { GetOrganizationQuery } from '../../core/query/get-organization.query';

@Resolver(() => Organization)
export class OrganizationResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Query(() => Organization)
	async organization(@Args('id') id: string): Promise<Organization> {
		try {
			return await this.queryBus.execute<GetOrganizationQuery, Organization>(
				new GetOrganizationQuery(id),
			);
		} catch (error) {
			if (error instanceof OrganizationNotFoundException) {
				throw new PresentableNotFoundException(
					`Die Organisation mit der ID ${id} wurde nicht gefunden.`,
				);
			}

			throw error;
		}
	}

	@Mutation(() => Organization)
	async updateOrganizationGeoSettings(
		@Args('id') id: string,
		@Args('geoSettings') geoSettings: OrganizationGeoSettings,
	): Promise<Organization> {
		try {
			return await this.commandBus.execute(
				new UpdateOrganizationGeoSettingsCommand(id, geoSettings),
			);
		} catch (error) {
			if (error instanceof ValidationException) {
				throw PresentableValidationException.fromCoreValidationException(
					'Die Einstellungen enthalten invalide Werte.',
					error,
				);
			} else if (error instanceof OrganizationNotFoundException) {
				throw new PresentableNotFoundException(
					`Die Organisation mit der ID ${error.orgId} wurde nicht gefunden.`,
				);
			}

			throw error;
		}
	}

	@Mutation(() => Organization)
	async createOrganization(
		@Args('name') name: string,
		@Args('geoSettings') geoSettings: OrganizationGeoSettings,
	): Promise<Organization> {
		try {
			return await this.commandBus.execute(
				new CreateOrganizationCommand(name, geoSettings),
			);
		} catch (error) {
			if (error instanceof ValidationException) {
				throw PresentableValidationException.fromCoreValidationException(
					'Die Organisationsdaten enthalten invalide Werte.',
					error,
				);
			}

			throw error;
		}
	}
}
