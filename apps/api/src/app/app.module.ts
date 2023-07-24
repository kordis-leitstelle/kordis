import { classes } from '@automapper/classes';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@timonmasberg/automapper-nestjs';
import * as path from 'path';

import { AuthModule } from '@kordis/api/auth';
import { ObservabilityModule } from '@kordis/api/observability';
import { OrganizationModule } from '@kordis/api/organization';
import { SharedKernel, errorFormatterFactory } from '@kordis/api/shared';
import { WarningsModule } from '@kordis/api/warnings';
import { WeatherModule } from '@kordis/api/weather';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GraphqlSubscriptionsController } from './controllers/graphql-subscriptions.controller';

const FRAMEWORK_MODULES = Object.freeze([
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
	ScheduleModule.forRoot(),
	CacheModule.register({
		isGlobal: true,
	}),
]);

const FEATURE_MODULES = Object.freeze([
	OrganizationModule,
	WarningsModule.forRootAsync({
		useFactory: (config: ConfigService) => ({
			checkCronExpression:
				config.get('WARNING_CHECK_CRON_EXPRESSION') ?? undefined,
		}),
		inject: [ConfigService],
	}),
	WeatherModule.forRootAsync({
		useFactory: (config: ConfigService) => ({
			azureMapKey: config.get('AZURE_MAP_KEY') ?? undefined,
		}),
		inject: [ConfigService],
	}),
]);

const UTILITY_MODULES = Object.freeze([
	SharedKernel,
	AuthModule,
	ObservabilityModule.forRoot(
		process.env.NODE_ENV === 'production' && !process.env.GITHUB_ACTIONS
			? 'sentry'
			: 'dev',
	),
]);

@Module({
	imports: [...FRAMEWORK_MODULES, ...UTILITY_MODULES, ...FEATURE_MODULES],
	providers: [AppService, AppResolver],
	controllers: [GraphqlSubscriptionsController],
})
export class AppModule {}
