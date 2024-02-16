import { IEvent } from '@nestjs/cqrs';

export class UserDeactivatedEvent implements IEvent {
	constructor(readonly userId: string) {}
}
