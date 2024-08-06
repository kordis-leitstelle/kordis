import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, ValidateIf } from 'class-validator';

import { FilterableOperationProcessState } from '../../../core/repository/dto/operation-filter.dto';

registerEnumType(FilterableOperationProcessState, {
	name: 'FilterableOperationProcessState',
});

@InputType()
export class OperationFilterInput {
	@Field(() => [FilterableOperationProcessState], { nullable: true })
	@IsEnum(FilterableOperationProcessState, { each: true })
	@ValidateIf((filter) => filter.processState !== undefined)
	processStates?: FilterableOperationProcessState[];
}
