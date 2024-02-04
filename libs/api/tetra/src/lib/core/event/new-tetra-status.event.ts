import { IEvent } from '@nestjs/cqrs';

export class NewTetraStatusEvent implements IEvent {
	constructor(
		public readonly orgId: string,
		public readonly issi: string,
		public readonly status: number,
		public readonly sentAt: Date,
		public readonly source: string,
	) {}
}
