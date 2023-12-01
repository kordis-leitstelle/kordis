import { Inject, Logger } from '@nestjs/common';
import type { EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';

import type {
	Organization,
	OrganizationGeoSettings,
} from '../entity/organization.entity';
import { OrganizationGeoSettingsUpdatedEvent } from '../event/organization-geo-settings-updated.event';
import { OrganizationNotFoundException } from '../exceptions/organization-not-found.exception';
import type { OrganizationRepository } from '../repository/organization.repository';
import { ORGANIZATION_REPOSITORY } from '../repository/organization.repository';

export class UpdateOrganizationGeoSettingsCommand {
	constructor(
		public readonly orgId: string,
		public readonly geoSettings: OrganizationGeoSettings,
	) {}
}

@CommandHandler(UpdateOrganizationGeoSettingsCommand)
export class UpdateOrganizationGeoSettingsHandler
	implements ICommandHandler<UpdateOrganizationGeoSettingsCommand>
{
	private readonly logger: KordisLogger = new Logger(
		UpdateOrganizationGeoSettingsHandler.name,
	);

	constructor(
		@Inject(ORGANIZATION_REPOSITORY)
		private readonly repository: OrganizationRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		command: UpdateOrganizationGeoSettingsCommand,
	): Promise<Organization> {
		const org = await this.repository.findById(command.orgId);

		if (!org) {
			throw new OrganizationNotFoundException(command.orgId);
		}

		org.geoSettings = command.geoSettings;

		await org.validOrThrow();

		await this.repository.update(org);

		this.logger.log('Organization geo settings updated', { updatedOrg: org });
		this.eventBus.publish(
			new OrganizationGeoSettingsUpdatedEvent(org.id, org.geoSettings),
		);

		return org;
	}
}
