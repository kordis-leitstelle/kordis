import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';

import { Providers } from '../../infra/provider/providers.type';
import {
	ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY,
	OrgShipPositionsProviderRepository,
} from '../repository/org-ship-positions-provider.repository';

export class UpsertOrgShipPositionsProviderCommand {
	constructor(
		public readonly orgId: string,
		public readonly provider: Providers,
	) {}
}

@CommandHandler(UpsertOrgShipPositionsProviderCommand)
export class UpsertOrgShipPositionsProvideHandler
	implements ICommandHandler<UpsertOrgShipPositionsProviderCommand>
{
	private readonly logger: KordisLogger = new Logger(
		UpsertOrgShipPositionsProvideHandler.name,
	);

	constructor(
		@Inject(ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY)
		private readonly orgShipPositionsProviderRepository: OrgShipPositionsProviderRepository,
	) {}

	async execute({
		orgId,
		provider,
	}: UpsertOrgShipPositionsProviderCommand): Promise<void> {
		await this.orgShipPositionsProviderRepository.upsert(orgId, provider);
	}
}
