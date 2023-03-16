import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import {
	AuthUserExtractorStrategy,
	ExtractUserFromMsPrincipleHeader,
} from './auth-user-extractor-strategies/auth-user-extractor.strategy';
import { AuthInterceptor } from './interceptors/auth.interceptor';

const SHARED_PROVIDERS = [
	{
		provide: AuthUserExtractorStrategy,
		useClass: ExtractUserFromMsPrincipleHeader,
	},
];

@Module({
	providers: [
		{
			provide: AuthUserExtractorStrategy,
			useClass: ExtractUserFromMsPrincipleHeader,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: AuthInterceptor,
		},
	],
})
export class AuthModule {}
