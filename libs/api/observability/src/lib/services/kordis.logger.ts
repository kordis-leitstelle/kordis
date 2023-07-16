import { Inject, LoggerService } from '@nestjs/common';

import {
	KORDIS_LOGGER_SERVICE,
	KordisLoggerService,
} from './kordis-logger-service.interface';
import { KordisLogger } from './kordis-logger.interface';

export class KordisLoggerImpl implements LoggerService, KordisLogger {
	constructor(
		@Inject(KORDIS_LOGGER_SERVICE) private readonly logger: KordisLoggerService,
	) {}

	debug(message: string, ...optionalParams: unknown[]): void {
		const { context, args } = this.getDestructedParams(optionalParams);
		this.logger.debug(message, context, args);
	}

	error(message: string, ...optionalParams: unknown[]): void {
		const { context, args, leftOverParams } =
			this.getDestructedParams(optionalParams);
		const trace =
			leftOverParams && leftOverParams.length > 0
				? (leftOverParams[0] as string) || undefined
				: undefined;

		this.logger.error(message, trace, context, args);
	}

	log(message: string, ...optionalParams: unknown[]): void {
		const { context, args } = this.getDestructedParams(optionalParams);
		this.logger.log(message, context, args);
	}

	verbose(message: string, ...optionalParams: unknown[]): void {
		const { context, args } = this.getDestructedParams(optionalParams);
		this.logger.verbose(message, context, args);
	}

	warn(message: string, ...optionalParams: unknown[]): void {
		const { context, args } = this.getDestructedParams(optionalParams);
		this.logger.warn(message, context, args);
	}

	private getDestructedParams(params: unknown[]): {
		args: object | undefined;
		context: string | undefined;
		leftOverParams: unknown[] | undefined;
	} {
		let context: string | undefined;
		let args: object | undefined;
		let leftOverParams: unknown[] | undefined;
		// context will be passed as last argument by nestjs, this is why we need the following
		if (params.length > 0) {
			const possibleContext = params[params.length - 1];
			if (typeof possibleContext === 'string') {
				context = possibleContext;
			}

			// the first argument can be an object, which will be passed as args to the logger, further parameters might be of interest, so we pass them as well
			leftOverParams = params.slice(0, -1);
			if (leftOverParams.length > 0 && typeof leftOverParams[0] === 'object') {
				args = leftOverParams.shift() as object;
			}
		}

		return { context, args, leftOverParams };
	}
}
