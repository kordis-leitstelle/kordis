import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Providers } from '../provider/providers.type';
import { ShipPositionsServiceOrgMappingsDocument } from '../schema/ship-positions-service-org-mappings.schema';

export class OrgShipPositionsProviderRepositoryImpl {
	constructor(
		@InjectModel(ShipPositionsServiceOrgMappingsDocument.name)
		private readonly shipPositionsServiceOrgMappingsModel: Model<ShipPositionsServiceOrgMappingsDocument>,
	) {}

	async upsert(orgId: string, provider: Providers): Promise<void> {
		await this.shipPositionsServiceOrgMappingsModel.updateOne(
			{ orgId },
			{ provider },
			{ upsert: true },
		);
	}

	async get(orgId: string): Promise<Providers> {
		const providerOrgMap = await this.shipPositionsServiceOrgMappingsModel
			.findOne({
				orgId,
			})
			.lean()
			.exec();

		if (!providerOrgMap) {
			throw new Error('Org has no ship positions provider mapping');
		}

		return providerOrgMap.provider;
	}
}
