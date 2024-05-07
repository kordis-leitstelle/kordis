export class RescueStationSignedOffEvent {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
	) {}
}
