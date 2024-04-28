import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';

import { AuthModule } from '@kordis/api/auth';
import { DeploymentModule } from '@kordis/api/deployment';
import { ObservabilityModule } from '@kordis/api/observability';
import { OrganizationModule } from '@kordis/api/organization';
import {
	DataLoaderContainer,
	DataLoaderContextProvider,
	MongoEncryptionClientProvider,
	SharedKernel,
	errorFormatterFactory,
	getMongoEncrKmsFromConfig,
} from '@kordis/api/shared';
import { TetraModule } from '@kordis/api/tetra';
import { UnitModule, UnitsSagaModule } from '@kordis/api/unit';
import { UsersModule } from '@kordis/api/user';

import { AppService } from './app.service';
import { GraphqlSubscriptionsController } from './controllers/graphql-subscriptions.controller';
import { HealthCheckController } from './controllers/health-check.controller';
import environment from './environment';

const isNextOrProdEnv = ['next', 'prod'].includes(
	process.env.ENVIRONMENT_NAME ?? '',
);

const FEATURE_MODULES = [
	OrganizationModule,
	UsersModule.forRoot(process.env.AUTH_PROVIDER === 'dev' ? 'dev' : 'aadb2c'),
	UnitModule,
	TetraModule,
	DeploymentModule,
];
const SAGA_MODULES = [UnitsSagaModule];
const UTILITY_MODULES = [
	SharedKernel,
	ObservabilityModule.forRoot(isNextOrProdEnv ? 'sentry' : 'dev'),
	AuthModule.forRoot(process.env.AUTH_PROVIDER === 'aadb2c' ? 'aadb2c' : 'dev'),
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
			useFactory: (
				config: ConfigService,
				dataLoaderContainer: DataLoaderContainer,
			) => ({
				autoSchemaFile: true,
				playground: config.get('NODE_ENV') !== 'production',
				formatError: errorFormatterFactory(
					config.get('NODE_ENV') === 'production',
				),
				context: (ctx: object) => ({
					...ctx,
					loadersProvider: new DataLoaderContextProvider(dataLoaderContainer),
				}),
			}),
			inject: [ConfigService, DataLoaderContainer],
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (
				config: ConfigService,
				encrManager: MongoEncryptionClientProvider,
			) => {
				const uri = config.getOrThrow<string>('MONGODB_URI');
				const { kms, masterKey, provider } = getMongoEncrKmsFromConfig(config);

				await encrManager.init(
					uri,
					provider,
					kms.keyVaultNamespace,
					kms.kmsProviders,
					masterKey,
				);

				return {
					uri,
					autoEncryption: {
						...kms,
						bypassAutoEncryption: true,
					},
					ignoreUndefined: true,
				};
			},
			inject: [ConfigService, MongoEncryptionClientProvider],
		}),
		AutomapperModule.forRoot({
			strategyInitializer: classes(),
		}),
		...UTILITY_MODULES,
		...FEATURE_MODULES,
		...SAGA_MODULES,
	],
	providers: [AppService],
	controllers: [GraphqlSubscriptionsController, HealthCheckController],
})
export class AppModule {}
