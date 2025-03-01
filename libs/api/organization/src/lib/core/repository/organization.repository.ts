import { OrganizationEntity } from '../entity/organization.entity';

export const ORGANIZATION_REPOSITORY = Symbol('OrganizationRepository');

export interface OrganizationRepository {
	findById(id: string): Promise<OrganizationEntity | null>;

	create(org: OrganizationEntity): Promise<OrganizationEntity>;

	update(org: OrganizationEntity): Promise<void>;
}
