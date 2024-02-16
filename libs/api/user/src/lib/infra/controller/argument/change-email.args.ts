import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@ArgsType()
export class ChangeEmailArgs {
	@Field()
	userId: string;

	@Field()
	@IsEmail({}, { message: 'Die E-Mail-Adresse ist invalide.' })
	newEmail: string;
}
