import { Organization } from '../entity/organization.entity';

export class OrganizationCreatedEvent {
	constructor(public readonly org: Organization) {}
}
