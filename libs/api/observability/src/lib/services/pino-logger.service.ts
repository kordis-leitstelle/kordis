import pino from 'pino';
// import pino-pretty to make dependency explicit to NX
import 'pino-pretty';

import { KordisLoggerService } from './kordis-logger-service.interface';

/*
 * This logger is used for logging with pino to the console. If debug is set to false, it will only log info and above as json output, otherwise as a pretty print.
 */
export class PinoLogger implements KordisLoggerService {
	private readonly logger: pino.Logger;

	constructor(debug: boolean) {
		this.logger = pino(
			debug
				? {
						level: 'trace',
						transport: {
							target: 'pino-pretty',
							colorize: true,
							translateTime: 'SYS:dd.mm.yyyy hh:MM:ss',
							ignore: 'pid,hostname',
						},
				  }
				: {
						level: 'info',
				  },
		);
	}

	log(message: string, context?: string, args?: object): void {
		this.logger.info(
			{
				context,
				...args,
			},
			message,
		);
	}

	error(
		message: string,
		trace?: string,
		context?: string,
		args?: object,
	): void {
		this.logger.error(
			{
				trace,
				context,
				...args,
			},
			message,
		);
	}

	warn(message: string, context?: string, args?: object): void {
		this.logger.warn(
			{
				context,
				...args,
			},
			message,
		);
	}

	debug(message: string, context?: string, args?: object): void {
		this.logger.debug(
			{
				context,
				...args,
			},
			message,
		);
	}

	verbose(message: string, context?: string, args?: object): void {
		this.logger.trace(
			{
				context,
				...args,
			},
			message,
		);
	}
}
