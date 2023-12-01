import type { LoggerService } from '@nestjs/common';

export const KORDIS_LOGGER_SERVICE = Symbol('KORDIS_LOGGER_SERVICE');

export interface KordisLoggerService extends LoggerService {
	log(message: string, context?: string, args?: object): void;

	error(message: string, trace?: string, context?: string, args?: object): void;

	warn(message: string, context?: string, args?: object): void;

	debug(message: string, context?: string, args?: object): void;

	verbose(message: string, context?: string, args?: object): void;
}
