export class RescueStationSignedInEvent {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
	) {}
}
