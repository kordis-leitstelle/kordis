import { createMock } from '@golevelup/ts-jest';

import type { KordisLoggerService } from './kordis-logger-service.interface';
import { KordisLoggerImpl } from './kordis.logger';

describe('KordisLoggerImpl', () => {
	let loggerServiceMock: KordisLoggerService;
	let logger: KordisLoggerImpl;

	beforeEach(() => {
		loggerServiceMock = createMock<KordisLoggerService>();
		logger = new KordisLoggerImpl(loggerServiceMock);
	});

	it('should call debug with correct parameter', () => {
		logger.debug(
			'Test debug message',
			{ someProp: 'someValue' },
			'nestJsInjectedContext',
		);

		expect(loggerServiceMock.debug).toHaveBeenCalledWith(
			'Test debug message',
			'nestJsInjectedContext',
			{ someProp: 'someValue' },
		);
	});

	it('should call error with correct parameter', () => {
		logger.error(
			'Test error message',
			{ someProp: 'someValue' },
			'nestJsInjectedTrace',
			'nestJsInjectedContext',
		);

		expect(loggerServiceMock.error).toHaveBeenCalledWith(
			'Test error message',
			'nestJsInjectedTrace',
			'nestJsInjectedContext',
			{ someProp: 'someValue' },
		);
	});

	it('should call error without trace and correct parameter', () => {
		logger.error(
			'Test error message',
			{ someProp: 'someValue' },
			'',
			'nestJsInjectedContext',
		);

		expect(loggerServiceMock.error).toHaveBeenCalledWith(
			'Test error message',
			undefined,
			'nestJsInjectedContext',
			{ someProp: 'someValue' },
		);
	});

	it('should call log with correct parameter', () => {
		logger.log(
			'Test log message',
			{ someProp: 'someValue' },
			'nestJsInjectedContext',
		);

		expect(loggerServiceMock.log).toHaveBeenCalledWith(
			'Test log message',
			'nestJsInjectedContext',
			{ someProp: 'someValue' },
		);
	});

	it('should call verbose with correct parameter', () => {
		logger.verbose(
			'Test verbose message',
			{ someProp: 'someValue' },
			'nestJsInjectedContext',
		);

		expect(loggerServiceMock.verbose).toHaveBeenCalledWith(
			'Test verbose message',
			'nestJsInjectedContext',
			{ someProp: 'someValue' },
		);
	});

	it('should call warn with correct parameter', () => {
		logger.warn(
			'Test warn message',
			{ someProp: 'someValue' },
			'nestJsInjectedContext',
		);

		expect(loggerServiceMock.warn).toHaveBeenCalledWith(
			'Test warn message',
			'nestJsInjectedContext',
			{ someProp: 'someValue' },
		);
	});
});
