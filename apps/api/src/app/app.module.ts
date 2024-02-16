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
import {
	MongoEncryptionClientProvider,
	errorFormatterFactory,
	getMongoEncrKmsFromConfig,
} from '@kordis/api/shared';
import { TetraModule } from '@kordis/api/tetra';
import { UsersModule } from '@kordis/api/user';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GraphqlSubscriptionsController } from './controllers/graphql-subscriptions.controller';
import { HealthCheckController } from './controllers/health-check.controller';
import environment from './environment';

const isNextOrProdEnv = ['next', 'prod'].includes(
	process.env.ENVIRONMENT_NAME ?? '',
);

const FEATURE_MODULES = [
	OrganizationModule,
	TetraModule,
	UsersModule.forRoot(process.env.AUTH_PROVIDER === 'dev' ? 'dev' : 'aadb2c'),
];
const UTILITY_MODULES = [
	AuthModule.forRoot(process.env.AUTH_PROVIDER === 'aadb2c' ? 'aadb2c' : 'dev'),
	ObservabilityModule.forRoot(isNextOrProdEnv ? 'sentry' : 'dev'),
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
				autoSchemaFile: true,
				playground: config.get('NODE_ENV') !== 'production',
				formatError: errorFormatterFactory(
					config.get('NODE_ENV') === 'production',
				),
			}),
			inject: [ConfigService],
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
				};
			},
			inject: [ConfigService, MongoEncryptionClientProvider],
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
