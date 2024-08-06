import { registerEnumType } from '@nestjs/graphql';

export enum OperationProcessState {
	ON_GOING = 'ON_GOING',
	COMPLETED = 'COMPLETED',
	ARCHIVED = 'ARCHIVED',
	DELETED = 'DELETED',
}

registerEnumType(OperationProcessState, {
	name: 'OperationProcessState',
});
