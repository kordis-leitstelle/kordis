import { OperationViewModel } from '../../infra/operation.view-model';

export class OperationCreatedEvent {
	constructor(
		readonly orgId: string,
		readonly operation: Readonly<OperationViewModel>,
	) {}
}
