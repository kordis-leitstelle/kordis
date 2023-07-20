import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { registerEnumType } from '@nestjs/graphql';

import { SharedKernel } from '@kordis/api/shared';
import { Role } from '@kordis/shared/auth';

import { ChangeEmailHandler } from './core/command/change-email.command';
import { CreateUserHandler } from './core/command/create-user.command';
import { DeactivateUserHandler } from './core/command/deactivate-user.command';
import { ReactivateUserHandler } from './core/command/reactivate-user.command';
import { OrganizationUsersHandler } from './core/query/organization-users.query';
import { UserLoginHistoryHandler } from './core/query/user-login-history.query';
import { USER_SERVICE } from './core/service/user.service';
import { UserResolver } from './infra/controller/user.resolver';
import { AADB2CUserService } from './infra/service/aadb2c-user.service';
import { DevUserService } from './infra/service/dev-user.service';

const PROVIDERS = Object.freeze([
	ChangeEmailHandler,
	CreateUserHandler,
	DeactivateUserHandler,
	ReactivateUserHandler,
	UserLoginHistoryHandler,
	OrganizationUsersHandler,
	UserResolver,
]);

class BaseUsersModule {
	constructor() {
		registerEnumType(Role, {
			name: 'Role',
		});
	}
}

@Module({
	imports: [HttpModule, CqrsModule, SharedKernel],
	providers: [
		{
			provide: USER_SERVICE,
			useClass: AADB2CUserService,
		},
		...PROVIDERS,
	],
})
export class UsersModule extends BaseUsersModule {}

@Module({
	providers: [
		{
			provide: USER_SERVICE,
			useClass: DevUserService,
		},
		...PROVIDERS,
	],
})
export class DevUsersModule extends BaseUsersModule {}
