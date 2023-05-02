import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';

import { AuthModule } from '@kordis/api/auth';
import { SharedKernel } from '@kordis/api/shared';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GraphqlSubscriptionsController } from './controllers/graphql-subscriptions.controller';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			envFilePath: path.resolve(__dirname, '.env'),
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile:
				process.env.NODE_ENV !== 'production'
					? path.join(process.cwd(), 'apps/api/src/schema.gql')
					: true,
			playground: process.env.NODE_ENV !== 'production',
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				uri: config.getOrThrow<string>('MONGODB_URI'),
			}),
			inject: [ConfigService],
		}),
		SharedKernel,
		AuthModule,
	],
	providers: [AppService, AppResolver],
	controllers: [GraphqlSubscriptionsController],
})
export class AppModule {}
