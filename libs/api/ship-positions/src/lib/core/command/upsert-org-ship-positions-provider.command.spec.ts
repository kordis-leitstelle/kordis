import { createMock } from '@golevelup/ts-jest';

import { OrgShipPositionsProviderRepository } from '../repository/org-ship-positions-provider.repository';
import { UpsertOrgShipPositionsProvideHandler } from './upsert-org-ship-positions-provider.command';

describe('UpsertOrgShipPositionsProviderCommand', () => {
	it('should call org repository upsert on execute', () => {
		const repoMock = createMock<OrgShipPositionsProviderRepository>();
		const upsertOrgShipPositionsProvideHandler =
			new UpsertOrgShipPositionsProvideHandler(repoMock);
		const orgId = 'orgId';
		const provider = 'none';
		upsertOrgShipPositionsProvideHandler.execute({ orgId, provider });
		expect(repoMock.upsert).toHaveBeenCalledWith(orgId, provider);
	});
});
