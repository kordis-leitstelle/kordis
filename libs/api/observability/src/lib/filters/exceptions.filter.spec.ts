import * as Sentry from '@sentry/node';

import { PresentableException } from '@kordis/api/shared';

import { SentryExceptionsFilter } from './sentry-exceptions.filter';

describe('ExceptionsFilter', () => {
	let sentryExceptionsFilter: SentryExceptionsFilter;
	let captureMessageMock: jest.Mock;
	let captureExceptionMock: jest.Mock;

	beforeEach(() => {
		captureMessageMock = jest.fn();
		captureExceptionMock = jest.fn();

		(Sentry.captureMessage as jest.Mock) = captureMessageMock;
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

		expect(captureMessageMock).toHaveBeenCalledTimes(1);
		expect(captureMessageMock).toHaveBeenCalledWith('code: message', {
			level: 'info',
			tags: {
				code: 'code',
				name: presentableException.name,
				message: 'message',
				stack: presentableException.stack,
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
		expect(captureMessageMock).not.toHaveBeenCalled();
	});
});
