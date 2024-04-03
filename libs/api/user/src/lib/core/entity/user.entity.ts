import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Role } from '@kordis/shared/model';

@ObjectType()
export class UserEntity {
	@Field(() => ID)
	id: string;

	@Field()
	userName: string;

	@Field()
	firstName: string;

	@Field()
	lastName: string;

	@Field()
	email: string;

	@Field(() => String)
	role: Role;

	@Field()
	organizationId: string;

	@Field()
	deactivated: boolean;
}
