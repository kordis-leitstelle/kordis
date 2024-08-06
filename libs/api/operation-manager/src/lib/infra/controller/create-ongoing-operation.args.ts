import { InputType, OmitType } from '@nestjs/graphql';

import { CreateOperationInput } from '@kordis/api/operation';


@InputType()
export class CreateOngoingOperationArgs extends OmitType(CreateOperationInput, [
	'end',
] as const) {}
