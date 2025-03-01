export class UnitAlreadyInvolvedException extends Error {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
		readonly operationId: string,
	) {
		super(`The unit ${unitId} is already involved in operation ${operationId}`);
	}
}
