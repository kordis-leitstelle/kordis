import { Providers } from '../../infra/provider/providers.type';

export const ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY = Symbol(
	'ORG_SHIP_POSITIONS_PROVIDER_REPOSITORY',
);

export interface OrgShipPositionsProviderRepository {
	get(orgId: string): Promise<Providers>;

	upsert(orgId: string, mapping: Providers): Promise<void>;
}
