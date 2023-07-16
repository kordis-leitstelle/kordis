import { LoggerService } from '@nestjs/common';

export interface KordisLogger extends LoggerService {
	log(message: string, args?: object): void;

	error(message: string, trace?: string, args?: object): void;

	warn(message: string, args?: object): void;

	debug(message: string, args?: object): void;

	verbose(message: string, args?: object): void;
}
