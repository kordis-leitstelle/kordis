import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { VerifyAADB2CJWTStrategy } from './auth-strategies/verify-aadb2c-jwt.strategy';
import { VerifyAuthUserStrategy } from './auth-strategies/verify-auth-user.strategy';
import { VerifyDevBearerStrategy } from './auth-strategies/verify-dev-bearer.strategy';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@Module({
	providers: [
		{
			provide: VerifyAuthUserStrategy,
			useClass: VerifyAADB2CJWTStrategy,
		},
	],
	exports: [VerifyAuthUserStrategy],
})
class AADB2CAuthModule {}

@Module({
	providers: [
		{
			provide: VerifyAuthUserStrategy,
			useClass: VerifyDevBearerStrategy,
		},
	],
	exports: [VerifyAuthUserStrategy],
})
class DevAuthModule {}

const AUTH_MODULES = Object.freeze({
	dev: DevAuthModule,
	aadb2c: AADB2CAuthModule,
});

@Module({})
export class AuthModule {
	static forRoot(authProvider: keyof typeof AUTH_MODULES): DynamicModule {
		return {
			module: AuthModule,
			imports: [AUTH_MODULES[authProvider]],
			providers: [
				{
					provide: APP_INTERCEPTOR,
					useClass: AuthInterceptor,
				},
			],
		};
	}
}
