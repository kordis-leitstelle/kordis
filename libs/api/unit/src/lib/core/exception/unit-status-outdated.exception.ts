export class UnitStatusOutdatedException extends Error {
	constructor() {
		super('Unit status outdated.');
	}
}
