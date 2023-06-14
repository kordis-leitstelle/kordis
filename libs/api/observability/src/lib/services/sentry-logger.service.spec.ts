import * as Sentry from '@sentry/node';

import { PinoLogger } from './pino-logger.service';
import { SentryLogger } from './sentry-logger.service';

jest.mock('@sentry/node', () => ({
	addBreadcrumb: jest.fn(),
}));

// mock to disable console output
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

describe('SentryLogger', () => {
	let logger: SentryLogger;
	let addBreadcrumbSpy: jest.SpyInstance;

	beforeEach(() => {
		addBreadcrumbSpy = jest.spyOn(Sentry, 'addBreadcrumb').mockImplementation();
		logger = new SentryLogger();
	});

	afterEach(() => {
		addBreadcrumbSpy.mockClear();
	});

	it('should call the log method of the parent class and add breadcrumb to Sentry', () => {
		const message = 'Test log message';
		const context = 'Test context';
		const pinoLoggerSpy = jest.spyOn(PinoLogger.prototype, 'log');

		logger.log(message, context, { some: 'object' });
		expect(pinoLoggerSpy).toHaveBeenCalledWith(message, context, {
			some: 'object',
		});
		expect(addBreadcrumbSpy).toHaveBeenCalledWith({
			message,
			type: 'logger',
			level: 'log',
			data: { context, some: 'object' },
		});
	});

	it('should call the error method of the parent class and add breadcrumb to Sentry', () => {
		const message = 'Test error message';
		const trace = 'Test error trace';
		const context = 'Test context';
		const pinoLoggerSpy = jest.spyOn(PinoLogger.prototype, 'error');

		logger.error(message, trace, context, {
			some: 'object',
		});
		expect(pinoLoggerSpy).toHaveBeenCalledWith(message, trace, context, {
			some: 'object',
		});
		expect(addBreadcrumbSpy).toHaveBeenCalledWith({
			message,
			type: 'logger',
			level: 'error',
			data: { context, trace, some: 'object' },
		});
	});

	it('should call the warn and add breadcrumb to Sentry', () => {
		const message = 'Test warn message';
		const context = 'Test context';
		const pinoLoggerSpy = jest.spyOn(PinoLogger.prototype, 'warn');

		logger.warn(message, context, {
			some: 'object',
		});

		expect(pinoLoggerSpy).toHaveBeenCalledWith(message, context, {
			some: 'object',
		});
		expect(addBreadcrumbSpy).toHaveBeenCalledWith({
			message,
			type: 'logger',
			level: 'warning',
			data: { context, some: 'object' },
		});
	});
});
