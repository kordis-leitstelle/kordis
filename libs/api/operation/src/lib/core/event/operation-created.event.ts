import { Operation } from '../entity/operation.entity';

export class OperationCreatedEvent {
	constructor(public readonly operation: Operation) {}
}
