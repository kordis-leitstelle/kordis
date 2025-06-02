import { InputType, OmitType } from '@nestjs/graphql';

import { CreateOperationInput } from '@kordis/api/operation';

@InputType()
export class CreateOngoingOperationInput extends OmitType(
	CreateOperationInput,
	['end'] as const,
) {}
