import { TetraConfig } from '../entity/tetra-config.entitiy';

export const TETRA_CONFIG_REPOSITORY = Symbol('TetraConfigRepository');

export interface TetraConfigRepository {
	findByWebhookAccessKey(key: string): Promise<TetraConfig | null>;

	findByOrgId(orgId: string): Promise<TetraConfig | null>;
}
