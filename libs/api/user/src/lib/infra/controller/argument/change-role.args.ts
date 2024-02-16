import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';

import { Role } from '@kordis/shared/model';

@ArgsType()
export class ChangeRoleArgs {
	@Field()
	userId: string;

	@Field(() => Role)
	@IsEnum(Role, { message: 'Die Rolle ist invalide.' })
	newRole: Role;
}
