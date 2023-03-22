/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { cors: true });
	const config = app.get(ConfigService);

	const envPort = config.get('PORT');
	const port = envPort ? +envPort : 3000;
	await app.listen(port);

	Logger.log(`🚀 Application is running on: http://localhost:${port}}`);
}

bootstrap();
