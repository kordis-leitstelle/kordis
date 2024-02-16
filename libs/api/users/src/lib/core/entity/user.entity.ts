import { Field, ObjectType } from '@nestjs/graphql';

import { Role } from '@kordis/shared/auth';

@ObjectType()
export class UserEntity {
	@Field()
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
