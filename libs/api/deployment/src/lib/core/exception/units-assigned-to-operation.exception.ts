export class UnitsAssignedToOperationException extends Error {
	constructor(
		readonly relatedEntities: {
			opId: string;
			unitId: string;
		}[],
	) {
		super(
			`Units are assigned to an operation: ${relatedEntities
				.map((e) => `Unit ID: ${e.unitId}, Operation ID: ${e.opId}`)
				.join(', ')}`,
		);
	}
}
