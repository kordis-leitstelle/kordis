import { classes } from '@automapper/classes';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomapperModule } from '@timonmasberg/automapper-nestjs';
import * as path from 'path';

import { AuthModule } from '@kordis/api/auth';
import { ObservabilityModule } from '@kordis/api/observability';
import { OrganizationModule } from '@kordis/api/organization';
import { SharedKernel, errorFormatterFactory } from '@kordis/api/shared';
import { UsersModule } from '@kordis/api/users';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GraphqlSubscriptionsController } from './controllers/graphql-subscriptions.controller';

const IS_NON_CI_PROD =
	process.env.NODE_ENV === 'production' && !process.env.GITHUB_ACTIONS;
const IS_NEXT_DEPLOYMENT = process.env.ENVIRONMENT_NAME === 'next';
const IS_PROD_DEPLOYMENT = process.env.ENVIRONMENT_NAME === 'prod';

const FEATURE_MODULES = [
	OrganizationModule,
	UsersModule.forRoot(
		IS_NEXT_DEPLOYMENT || IS_PROD_DEPLOYMENT ? 'aadb2c' : 'dev',
	),
];
const UTILITY_MODULES = [
	SharedKernel,
	AuthModule,
	ObservabilityModule.forRoot(IS_NON_CI_PROD ? 'sentry' : 'dev'),
];

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			envFilePath: path.resolve(__dirname, '.env'),
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			imports: [ConfigModule],
			driver: ApolloDriver,
			useFactory: (config: ConfigService) => ({
				autoSchemaFile:
					config.get('NODE_ENV') !== 'production'
						? path.join(process.cwd(), 'apps/api/src/schema.gql')
						: true,
				playground: config.get('NODE_ENV') !== 'production',
				formatError: errorFormatterFactory(
					config.get('NODE_ENV') === 'production',
				),
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				uri: config.getOrThrow<string>('MONGODB_URI'),
			}),
			inject: [ConfigService],
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
		...UTILITY_MODULES,
		...FEATURE_MODULES,
	],
	providers: [AppService, AppResolver],
	controllers: [GraphqlSubscriptionsController],
})
export class AppModule {}
