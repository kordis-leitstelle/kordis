// @formatter:off otelSdk has to imported on the very top!
// until https://github.com/open-telemetry/opentelemetry-js/issues/3450 is fixed, we have to import the oTel sdk via a relative path
// eslint-disable-next-line @nx/enforce-module-boundaries
import "../../../libs/api/observability/src/lib/oTelSdk";

import {Logger, ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {NestFactory} from "@nestjs/core";

import {AppModule} from "./app/app.module";
import {PresentableValidationException} from "@kordis/api/shared";


async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { cors: true, bufferLogs: true });
	app.useLogger(app.get(Logger));
	app.useGlobalPipes(new ValidationPipe({
			transform: true,
			exceptionFactory: (errors) => PresentableValidationException.fromClassValidationErrors(errors)
		}
	));
	const config = app.get(ConfigService);
	const envPort = config.get('PORT');

	const port = envPort ? +envPort : 3000;
	await app.listen(port);

	Logger.log(`🚀 Kordis is running on: http://localhost:${port}}`);
}

bootstrap();
