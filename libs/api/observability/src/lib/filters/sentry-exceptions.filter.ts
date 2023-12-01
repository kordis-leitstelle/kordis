import type { ExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { PresentableException } from '@kordis/api/shared';

@Catch()
export class SentryExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown): void {
		if (exception instanceof PresentableException) {
			// if this is a presentable error, such as a validation error, we don't want to log it as an error but rather as an information to have the context for possible future debugging
			Sentry.addBreadcrumb({
				level: 'error',
				message: exception.message,
				data: {
					code: exception.code,
					name: exception.name,
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
