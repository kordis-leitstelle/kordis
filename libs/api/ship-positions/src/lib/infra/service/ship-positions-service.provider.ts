import { Inject } from '@nestjs/common';

import {
	ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY,
	OrgShipPositionsProviderRepository,
} from '../../core/repository/org-ship-positions-provider.repository';
import { ShipPositionsServiceProvider } from '../../core/service/ship-positions-service.provider';
import { ShipPositionsService } from '../../core/service/ship-positions.service';
import { HpaShipPositionsService } from '../provider/hpa/hpa-ship-positions.service';
import { NoopShipPositionsService } from '../provider/noop/noop-ship-positions.service';

export class ShipPositionsServiceProviderImpl
	implements ShipPositionsServiceProvider
{
	constructor(
		@Inject(ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY)
		private readonly orgShipPositionsProviderRepo: OrgShipPositionsProviderRepository,
		private readonly noopShipPositionsService: NoopShipPositionsService,
		private readonly hpaShipPositionsService: HpaShipPositionsService,
	) {}

	async forOrg(orgId: string): Promise<ShipPositionsService> {
		const provider = await this.orgShipPositionsProviderRepo.get(orgId);

		switch (provider) {
			case 'hpa':
				return this.hpaShipPositionsService;
			case 'none':
				return this.noopShipPositionsService;
			default:
				throw new Error(`Unknown ship positions provider: ${provider}`);
		}
	}
}
