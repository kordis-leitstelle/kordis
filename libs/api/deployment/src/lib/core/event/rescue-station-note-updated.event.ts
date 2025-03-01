export class RescueStationNoteUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly deploymentId: string,
	) {}
}
