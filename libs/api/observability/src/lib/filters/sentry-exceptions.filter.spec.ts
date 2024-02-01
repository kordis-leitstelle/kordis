import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { PresentableException } from '@kordis/api/shared';

import { SentryExceptionsFilter } from './sentry-exceptions.filter';

describe('SentryExceptionsFilter', () => {
	let sentryExceptionsFilter: SentryExceptionsFilter;
	let addBreadcrumbMock: jest.Mock;
	let captureExceptionMock: jest.Mock;
	let logger: DeepMocked<Logger>;
	beforeEach(async () => {
		addBreadcrumbMock = jest.fn();
		captureExceptionMock = jest.fn();
		logger = createMock<Logger>();

		(Sentry.addBreadcrumb as jest.Mock) = addBreadcrumbMock;
		(Sentry.captureException as jest.Mock) = captureExceptionMock;

		sentryExceptionsFilter = new SentryExceptionsFilter(logger);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should capture a presentable exception as an info message', () => {
		class MockPresentableException extends PresentableException {
			code = 'code';

			constructor() {
				super('message');
			}
		}

		const presentableException = new MockPresentableException();

		sentryExceptionsFilter.catch(presentableException);

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith('message', undefined, {
			name: 'Error',
			code: 'code',
			stack: expect.any(String),
		});
		expect(captureExceptionMock).not.toHaveBeenCalled();
	});

	it('should capture a non-presentable exception as an error', () => {
		const exception = new Error('Some error');

		sentryExceptionsFilter.catch(exception);

		expect(captureExceptionMock).toHaveBeenCalledTimes(1);
		expect(captureExceptionMock).toHaveBeenCalledWith(exception, {
			level: 'error',
		});
		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(
			'Caught unhandled exception that was not presentable',
			undefined,
			{
				exception,
			},
		);
		expect(addBreadcrumbMock).not.toHaveBeenCalled();
	});
});
