import pino from 'pino';
// import pino-pretty to make dependency explicit to NX
import 'pino-pretty';

import { PinoLogger } from './pino-logger.service';

jest.mock('pino', () => {
	return {
		__esModule: true,
		default: jest.fn().mockReturnValue({
			info: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
			debug: jest.fn(),
			trace: jest.fn(),
		}),
	};
});

describe('PinoLogger', () => {
	let logger: PinoLogger;
	const pinoMock = pino as unknown as jest.Mock;
	const pinoLoggerMock: jest.Mocked<pino.Logger> = pinoMock();

	it('should initialize pino with the correct configuration when debug is true', () => {
		const debug = true;
		logger = new PinoLogger(debug);

		expect(pinoMock).toHaveBeenCalledWith({
			level: 'trace',
			transport: {
				target: 'pino-pretty',
				colorize: true,
				translateTime: 'SYS:dd.mm.yyyy hh:MM:ss',
				ignore: 'pid,hostname',
			},
		});
	});

	it('should initialize pino with the correct configuration when debug is false', () => {
		const debug = false;
		logger = new PinoLogger(debug);

		expect(pinoMock).toHaveBeenCalledWith({
			level: 'info',
		});
	});

	it('should call pino info on log', () => {
		logger = new PinoLogger(false);
		logger.log('message', 'context');

		expect(pinoLoggerMock.info).toHaveBeenCalledWith(
			{ context: 'context' },
			'message',
		);

		logger.log('message', 'context', { some: 'object' });
		expect(pinoLoggerMock.info).toHaveBeenCalledWith(
			{ some: 'object', context: 'context' },
			'message',
		);
	});

	it('should call pino debug on debug', () => {
		logger = new PinoLogger(false);
		logger.debug('message', 'context');

		expect(pinoLoggerMock.debug).toHaveBeenCalledWith(
			{ context: 'context' },
			'message',
		);

		logger.debug('message', 'context', { some: 'object' });
		expect(pinoLoggerMock.debug).toHaveBeenCalledWith(
			{ some: 'object', context: 'context' },
			'message',
		);
	});

	it('should call pino trace on verbose', () => {
		logger = new PinoLogger(false);
		logger.verbose('message', 'context');

		expect(pinoLoggerMock.trace).toHaveBeenCalledWith(
			{ context: 'context' },
			'message',
		);

		logger.verbose('message', 'context', { some: 'object' });
		expect(pinoLoggerMock.trace).toHaveBeenCalledWith(
			{ some: 'object', context: 'context' },
			'message',
		);
	});

	it('should call pino warn on warn', () => {
		logger = new PinoLogger(false);
		logger.warn('message', 'context');

		expect(pinoLoggerMock.warn).toHaveBeenCalledWith(
			{ context: 'context' },
			'message',
		);

		logger.warn('message', 'context', { some: 'object' });
		expect(pinoLoggerMock.warn).toHaveBeenCalledWith(
			{ some: 'object', context: 'context' },
			'message',
		);
	});

	it('should call pino error on error', () => {
		logger = new PinoLogger(false);
		logger.error('message', 'trace', 'context');

		expect(pinoLoggerMock.error).toHaveBeenCalledWith(
			{ context: 'context', trace: 'trace' },
			'message',
		);

		logger.error('message', 'trace', 'context', { some: 'object' });
		expect(pinoLoggerMock.error).toHaveBeenCalledWith(
			{ context: 'context', some: 'object', trace: 'trace' },
			'message',
		);
	});
});
