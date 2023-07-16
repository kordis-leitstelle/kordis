import * as Sentry from '@sentry/node';

import { PresentableException } from '@kordis/api/shared';

import { SentryExceptionsFilter } from './sentry-exceptions.filter';

describe('ExceptionsFilter', () => {
	let sentryExceptionsFilter: SentryExceptionsFilter;
	let addBreadcrumbMock: jest.Mock;
	let captureExceptionMock: jest.Mock;

	beforeEach(() => {
		addBreadcrumbMock = jest.fn();
		captureExceptionMock = jest.fn();

		(Sentry.addBreadcrumb as jest.Mock) = addBreadcrumbMock;
		(Sentry.captureException as jest.Mock) = captureExceptionMock;

		sentryExceptionsFilter = new SentryExceptionsFilter();
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

		expect(addBreadcrumbMock).toHaveBeenCalledTimes(1);
		expect(addBreadcrumbMock).toHaveBeenCalledWith({
			level: 'error',
			message: 'message',
			data: {
				name: 'Error',
				code: 'code',
				stack: expect.any(String),
			},
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
		expect(addBreadcrumbMock).not.toHaveBeenCalled();
	});
});
