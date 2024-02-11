import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { PresentableException } from '@kordis/api/shared';

import { KordisLogger } from '../services/kordis-logger.interface';

@Catch()
export class SentryExceptionsFilter implements ExceptionFilter {
	readonly logger: KordisLogger;

	constructor(_logger: Logger) {
		this.logger = _logger;
	}

	catch(exception: unknown): void {
		if (exception instanceof PresentableException) {
			// if this is a presentable error, such as a validation error, we don't want to log it as an error but rather as an information to have the context for possible future debugging
			this.logger.log(exception.message, {
				code: exception.code,
				name: exception.name,
				stack: exception.stack,
			});
		} else {
			this.logger.error(
				'Caught unhandled exception that was not presentable',
				undefined,
				{
					exception,
				},
			);

			Sentry.captureException(exception, {
				level: 'error',
			});
		}
	}
}
