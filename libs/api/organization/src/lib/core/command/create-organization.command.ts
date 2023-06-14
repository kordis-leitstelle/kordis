import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';

import {
	Organization,
	OrganizationGeoSettings,
} from '../entity/organization.entity';
import { OrganizationCreatedEvent } from '../event/organization-created.event';
import {
	ORGANIZATION_REPOSITORY,
	OrganizationRepository,
} from '../repository/organization.repository';

export class CreateOrganizationCommand {
	constructor(
		public readonly name: string,
		public readonly geoSettings: OrganizationGeoSettings,
	) {}
}

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler
	implements ICommandHandler<CreateOrganizationCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOrganizationHandler.name,
	);

	constructor(
		@Inject(ORGANIZATION_REPOSITORY)
		private readonly repository: OrganizationRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: CreateOrganizationCommand): Promise<Organization> {
		let org = new Organization();
		org.geoSettings = command.geoSettings;
		org.name = command.name;

		await org.validOrThrow();

		org = await this.repository.create(org);
		this.logger.log('Organization created', { org });

		this.eventBus.publish(new OrganizationCreatedEvent(org));

		return org;
	}
}
