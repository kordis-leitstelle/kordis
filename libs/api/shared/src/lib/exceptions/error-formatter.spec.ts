import { errorFormatterFactory } from './error-formatter';
import { PresentableException } from './presentable/presentable.exception';

describe('errorFormatterFactory', () => {
	class MockPresentableException extends PresentableException {
		code = 'MOCK_PRESENTABLE_EXCEPTION';

		constructor(message: string) {
			super(message);
		}
	}

	it('should format presentable exception correctly', () => {
		const formattedError = { message: 'Internal server error' };
		const presentableException = new MockPresentableException(
			'Custom error message',
		);
		const error = { originalError: presentableException };
		const formatter = errorFormatterFactory(false);

		const result = formatter(formattedError, error);

		expect(result).toEqual({
			message: 'Custom error message',
			extensions: { code: 'MOCK_PRESENTABLE_EXCEPTION' },
		});
	});

	it('should format unknown exception when sanitizeErrors is true', () => {
		const formattedError = { message: 'Internal server error' };
		const error = {};

		const formatter = errorFormatterFactory(true);
		const result = formatter(formattedError, error);

		expect(result).toEqual({
			message: 'Ein unbekannter Fehler ist aufgetreten.',
			extensions: { code: 'UNKNOWN_EXCEPTION' },
		});
	});

	it('should return formatted error when no presentable exception and sanitizeErrors is false', () => {
		const formattedError = { message: 'Internal server error' };
		const error = {};

		const formatter = errorFormatterFactory(false);
		const result = formatter(formattedError, error);

		expect(result).toEqual(formattedError);
	});
});
