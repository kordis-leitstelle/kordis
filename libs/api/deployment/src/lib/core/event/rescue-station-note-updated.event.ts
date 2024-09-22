export class RescueStationNoteUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
	) {}
}
