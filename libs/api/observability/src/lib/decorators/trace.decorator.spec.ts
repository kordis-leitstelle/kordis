import { SPAN_ACTIVE, TRACE_NAME, Trace } from './trace.decorator';

describe('TraceDecorator', () => {
	it('should set SPAN_ACTIVE metadata without traceName', () => {
		class TestClass {
			@Trace()
			testMethod(): void {}
		}

		expect(
			Reflect.getMetadata(SPAN_ACTIVE, TestClass.prototype.testMethod),
		).toBe(true);
		expect(
			Reflect.getMetadata(TRACE_NAME, TestClass.prototype.testMethod),
		).toBe(undefined);
	});

	it('should set SPAN_ACTIVE and TRACE_NAME metadata with traceName', () => {
		const traceName = 'test-trace-name';

		class TestClass {
			@Trace(traceName)
			testMethod(): void {}
		}

		expect(
			Reflect.getMetadata(SPAN_ACTIVE, TestClass.prototype.testMethod),
		).toBe(true);
		expect(
			Reflect.getMetadata(TRACE_NAME, TestClass.prototype.testMethod),
		).toBe(traceName);
	});
});
