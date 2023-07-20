import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { Role } from '@kordis/shared/auth';

@ArgsType()
export class CreateUserArgs {
	@Field()
	@IsString()
	@IsNotEmpty({ message: 'Der Vorname darf nicht leer sein.' })
	firstName: string;

	@Field()
	@IsString()
	@IsNotEmpty({ message: 'Der Nachname darf nicht leer sein.' })
	lastName: string;

	@Field()
	@IsString()
	@IsNotEmpty({ message: 'Der Benutzername darf nicht leer sein.' })
	username: string;

	@Field()
	@IsEmail({}, { message: 'Die E-Mail-Adresse ist invalide.' })
	email: string;

	@Field(() => Role)
	@IsEnum(Role, { message: 'Die Rolle ist invalide.' })
	role: Role;
}
