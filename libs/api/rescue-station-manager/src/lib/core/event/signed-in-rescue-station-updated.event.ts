export class SignedInRescueStationUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
	) {}
}
