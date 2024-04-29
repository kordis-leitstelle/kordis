export class UnitStatusUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
		readonly status: {
			status: number;
			receivedAt: Date;
			source: string;
		},
	) {}
}
