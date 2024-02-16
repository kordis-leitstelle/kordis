export class UnhandledTetraControlWebhookTypeException extends Error {
	constructor(type: string) {
		super(`Tetra control ${type} has no handler.`);
	}
}
