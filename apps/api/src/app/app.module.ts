import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';

import { AuthModule } from '@kordis/api/auth';
import { ObservabilityModule } from '@kordis/api/observability';
import { OrganizationModule } from '@kordis/api/organization';
import { SharedKernel, errorFormatterFactory } from '@kordis/api/shared';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GraphqlSubscriptionsController } from './controllers/graphql-subscriptions.controller';
import { HealthCheckController } from './controllers/health-check.controller';
import environment from './environment';

// todo: narrow this down, we should have either an explicit way of defining when to use what (currently hard, since ConfigService not available in forRoot), or we should have an environment variable that defines the environment
const isProdEnv =
	process.env.NODE_ENV === 'production' && !process.env.GITHUB_ACTIONS;
const FEATURE_MODULES = [OrganizationModule];
const UTILITY_MODULES = [
	SharedKernel,
	AuthModule.forRoot(isProdEnv ? 'aadb2c' : 'dev'),
	ObservabilityModule.forRoot(isProdEnv ? 'sentry' : 'dev'),
];

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			envFilePath: path.resolve(__dirname, '.env'),
			load: [environment],
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			imports: [ConfigModule],
			driver: ApolloDriver,
			useFactory: (config: ConfigService) => ({
				autoSchemaFile:
					config.get('NODE_ENV') !== 'production'
						? path.join(process.cwd(), 'apps/api/src/schema.gql')
						: true,
				subscriptions: {
					'graphql-ws': true,
				},
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
	controllers: [GraphqlSubscriptionsController, HealthCheckController],
})
export class AppModule {}
