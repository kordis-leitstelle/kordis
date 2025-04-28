import { Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

import { CreateOperationInput } from '@kordis/api/operation';

@InputType()
export class CreateOngoingOperationArgs extends OmitType(CreateOperationInput, [
	'end',
] as const) {}

@InputType()
export class OperationAlertArgs {
	@Field(() => [String])
	@IsString({ each: true })
	alertGroupIds: string[];

	@Field()
	@IsBoolean()
	hasPriority: boolean;

	@Field()
	@IsString()
	description: string;
}
