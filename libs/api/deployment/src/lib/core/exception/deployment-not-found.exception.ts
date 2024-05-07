export class DeploymentNotFoundException extends Error {
	constructor() {
		super('Deployment not found.');
	}
}
