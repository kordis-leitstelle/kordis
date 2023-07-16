export class OrganizationNotFoundException extends Error {
	constructor(readonly orgId: string) {
		super(`Organization ${orgId} not found.`);
	}
}
