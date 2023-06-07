import { Catch, ExceptionFilter } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { PresentableException } from '@kordis/api/shared';

@Catch()
export class SentryExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown): void {
		if (exception instanceof PresentableException) {
			// if this is a presentable error, such as a validation error, we don't want to log it as an error but rather as an information to have the context for possible future debugging
			Sentry.captureMessage(exception.code + ': ' + exception.message, {
				level: 'info',
				tags: {
					code: exception.code,
					name: exception.name,
					message: exception.message,
					stack: exception.stack,
				},
			});
		} else {
			Sentry.captureException(exception, {
				level: 'error',
			});
		}
	}
}
