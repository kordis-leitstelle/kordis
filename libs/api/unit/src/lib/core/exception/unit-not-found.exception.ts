export class UnitNotFoundException extends Error {
	constructor() {
		super('Unit not found.');
	}
}
