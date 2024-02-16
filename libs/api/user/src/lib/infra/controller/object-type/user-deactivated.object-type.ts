import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDeactivated {
	@Field({ nullable: true })
	userId: string;
}
