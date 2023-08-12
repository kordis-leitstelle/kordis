import { DeepMocked, createMock } from '@golevelup/ts-jest';

import { OrgShipPositionsProviderRepository } from '../../core/repository/org-ship-positions-provider.repository';
import { HpaShipPositionsService } from '../provider/hpa/hpa-ship-positions.service';
import { NoopShipPositionsService } from '../provider/noop/noop-ship-positions.service';
import { ShipPositionsServiceProviderImpl } from './ship-positions-service.provider';

describe('ShipPositionsServiceProviderImpl', () => {
	let service: ShipPositionsServiceProviderImpl;
	let orgShipPositionsProviderRepo: DeepMocked<OrgShipPositionsProviderRepository>;
	let noopShipPositionsService: NoopShipPositionsService;
	let hpaShipPositionsService: HpaShipPositionsService;

	beforeEach(() => {
		orgShipPositionsProviderRepo =
			createMock<OrgShipPositionsProviderRepository>();
		noopShipPositionsService = {} as NoopShipPositionsService;
		hpaShipPositionsService = {} as HpaShipPositionsService;

		service = new ShipPositionsServiceProviderImpl(
			orgShipPositionsProviderRepo,
			noopShipPositionsService,
			hpaShipPositionsService,
		);
	});

	it('should return HpaShipPositionsService when the provider is "hpa"', async () => {
		orgShipPositionsProviderRepo.get.mockResolvedValue('hpa');
		const result = await service.forOrg('orgId');

		expect(result).toBe(hpaShipPositionsService);
	});

	it('should return NoopShipPositionsService when the provider is "none"', async () => {
		orgShipPositionsProviderRepo.get.mockResolvedValue('none');

		const result = await service.forOrg('orgId');

		expect(result).toBe(noopShipPositionsService);
	});

	it('should throw an error for an unknown provider', async () => {
		orgShipPositionsProviderRepo.get.mockResolvedValue(
			'unknown-provider' as any,
		);

		await expect(service.forOrg('orgId')).rejects.toThrow(
			'Unknown ship positions provider: unknown-provider',
		);
	});
});
