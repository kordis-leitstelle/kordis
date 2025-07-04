export class ConfigNotFoundError extends Error {
	constructor(orgId: string) {
		super(`Alertprovider Config for org ${orgId} could not been found`);
	}
}
