import * as Sentry from '@sentry/node';

import { PinoLogger } from './pino-logger.service';

export class SentryLogger extends PinoLogger {
	constructor() {
		super(false);
	}

	override log(message: string, context?: string, args?: object): void {
		super.log(message, context, args);

		Sentry.addBreadcrumb({
			message,
			type: 'logger',
			level: 'log',
			data: { context, ...args },
		});
	}

	override error(
		message: string,
		trace?: string,
		context?: string,
		args?: object,
	): void {
		super.error(message, trace, context, args);

		Sentry.addBreadcrumb({
			message,
			type: 'logger',
			level: 'error',
			data: { context, trace, ...args },
		});
	}

	override warn(message: string, context?: string, args?: object): void {
		super.warn(message, context, args);

		Sentry.addBreadcrumb({
			message,
			type: 'logger',
			level: 'warning',
			data: { context, ...args },
		});
	}
}
