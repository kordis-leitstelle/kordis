import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql/utilities';
import { join } from 'path';

import { AppModule } from './app/app.module';

const generateSchema = async (): Promise<void> => {
	const app = await NestFactory.create(AppModule, { logger: false });
	await app.init();

	const { schema } = app.get(GraphQLSchemaHost);
	const outputPath = join(process.cwd(), 'dist/schema.gql');
	writeFileSync(outputPath, printSchema(schema));
	await app.close();
	// eslint-disable-next-line no-console
	console.log(`Scheme generated successfully at ${outputPath}`);
};

generateSchema()
	.then(() => process.exit())
	// eslint-disable-next-line no-console
	.catch(console.log);
