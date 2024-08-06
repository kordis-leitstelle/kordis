import { OperationProcessState } from '../../entity/operation-process-state.enum';

export enum FilterableOperationProcessState {
	ACTIVE = OperationProcessState.ON_GOING,
	COMPLETED = OperationProcessState.COMPLETED,
	ARCHIVED = OperationProcessState.ARCHIVED,
}

export class OperationFilterDto {
	processStates: FilterableOperationProcessState[];
}
