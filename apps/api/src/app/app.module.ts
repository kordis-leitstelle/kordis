import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as path from 'path';

import { AuthModule } from '@kordis/api/auth';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, cache: true }),
		AuthModule,
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile:
				process.env.NODE_ENV !== 'production'
					? path.join(process.cwd(), 'apps/api/src/schema.gql')
					: true,
			subscriptions: {
				'graphql-ws': true,
			},
			playground: process.env.NODE_ENV !== 'production',
		}),
	],
	providers: [AppService, AppResolver],
})
export class AppModule {}
