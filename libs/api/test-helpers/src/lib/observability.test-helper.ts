import { createMock } from '@golevelup/ts-jest';
import { Span, trace } from '@opentelemetry/api';
import { Tracer } from '@opentelemetry/tracing';

export function getComparablePrototypeSnapshot(prototype: Record<any, any>) {
	return JSON.stringify(
		Object.getOwnPropertyDescriptors(prototype),
		(key, value) => (typeof value === 'function' ? value.toString() : value),
	);
}

export function createTraceMocks() {
	const tracerSpy = jest.spyOn(trace, 'getTracer');
	tracerSpy.mockReturnValue(createMock<Tracer>()); // makes sure always the same tracer is used
	const tracer = trace.getTracer('default');
	const startSpanSpy = jest.spyOn(tracer, 'startSpan');
	const spanMock = createMock<Span>();
	const spanSetAttributesSpy = jest.spyOn(spanMock, 'setAttributes');
	startSpanSpy.mockReturnValue(spanMock);
	const endSpanSpy = jest.spyOn(spanMock, 'end');

	return { startSpanSpy, endSpanSpy, spanSetAttributesSpy };
}
