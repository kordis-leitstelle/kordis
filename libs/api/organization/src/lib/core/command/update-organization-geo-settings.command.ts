import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { NotFoundException } from '@kordis/api/shared';

import {
	Organization,
	OrganizationGeoSettings,
} from '../entity/organization.entity';
import { OrganizationGeoSettingsUpdatedEvent } from '../event/organization-geo-settings-updated.event';
import {
	ORGANIZATION_REPOSITORY,
	OrganizationRepository,
} from '../repository/organization.repository';

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
			throw new NotFoundException();
		}

		org.settings.geo = command.geoSettings;

		await org.validOrThrow();

		await this.repository.update(org);

		this.eventBus.publish(
			new OrganizationGeoSettingsUpdatedEvent(org.id, org.settings.geo),
		);

		return org;
	}
}
