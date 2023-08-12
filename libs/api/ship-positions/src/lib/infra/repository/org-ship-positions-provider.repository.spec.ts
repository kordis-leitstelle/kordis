import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Model } from 'mongoose';

import { Providers } from '../provider/providers.type';
import { ShipPositionsServiceOrgMappingsDocument } from '../schema/ship-positions-service-org-mappings.schema';
import { OrgShipPositionsProviderRepositoryImpl } from './org-ship-positions-provider.repository';

describe('OrgShipPositionsProviderRepositoryImpl', () => {
	let repository: OrgShipPositionsProviderRepositoryImpl;
	let shipPositionsServiceOrgMappingsModel: DeepMocked<
		Model<ShipPositionsServiceOrgMappingsDocument>
	>;

	beforeEach(() => {
		shipPositionsServiceOrgMappingsModel =
			createMock<Model<ShipPositionsServiceOrgMappingsDocument>>();

		repository = new OrgShipPositionsProviderRepositoryImpl(
			shipPositionsServiceOrgMappingsModel,
		);
	});

	describe('upsert', () => {
		it('should update org id with provider and upset option', async () => {
			const orgId = 'org123';
			const provider: Providers = 'hpa';

			await repository.upsert(orgId, provider);

			expect(
				shipPositionsServiceOrgMappingsModel.updateOne,
			).toHaveBeenCalledWith({ orgId }, { provider }, { upsert: true });
		});
	});

	describe('get', () => {
		it('should return the provider', async () => {
			const orgId = 'orgId';
			const provider: Providers = 'hpa';

			shipPositionsServiceOrgMappingsModel.findOne.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ orgId, provider }),
				}),
			} as any);
			const result = await repository.get(orgId);

			expect(result).toBe(provider);
		});

		it('should throw an error when the org has no provider mapping', async () => {
			shipPositionsServiceOrgMappingsModel.findOne.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue(null),
				}),
			} as any);

			await expect(repository.get('orgId')).rejects.toThrow(
				'Org has no ship positions provider mapping',
			);
		});
	});
});
