import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';

import { Role } from '@kordis/shared/auth';

import { CreateUserHandler } from './core/command/create-user.command';
import { DeactivateUserHandler } from './core/command/deactivate-user.command';
import { ReactivateUserHandler } from './core/command/reactivate-user.command';
import { UpdateEmailHandler } from './core/command/update-email.command';
import { OrganizationUsersHandler } from './core/query/organization-users.query';
import { UserLoginHistoryHandler } from './core/query/user-login-history.query';
import { USER_SERVICE } from './core/service/user.service';
import { UserResolver } from './infra/controller/user.resolver';
import { AADB2CUserService } from './infra/service/aadb2c-user.service';
import { DevUserService } from './infra/service/dev-user.service';

@Module({
	imports: [HttpModule],
	providers: [
		{
			provide: USER_SERVICE,
			useClass: AADB2CUserService,
		},
	],
	exports: [USER_SERVICE],
})
class AADB2CUsersModule {}

@Module({
	providers: [
		{
			provide: USER_SERVICE,
			useClass: DevUserService,
		},
	],
	exports: [USER_SERVICE],
})
class DevUsersInMemoryModule {}

const USERS_MODULES = Object.freeze({
	dev: DevUsersInMemoryModule,
	aadb2c: AADB2CUsersModule,
});

@Module({})
export class UsersModule {
	constructor() {
		registerEnumType(Role, {
			name: 'Role',
		});
	}

	static forRoot(usersProvider: keyof typeof USERS_MODULES): DynamicModule {
		return {
			module: UsersModule,
			imports: [USERS_MODULES[usersProvider]],
			providers: [
				UpdateEmailHandler,
				CreateUserHandler,
				DeactivateUserHandler,
				ReactivateUserHandler,
				UserLoginHistoryHandler,
				OrganizationUsersHandler,
				UserResolver,
			],
		};
	}
}
