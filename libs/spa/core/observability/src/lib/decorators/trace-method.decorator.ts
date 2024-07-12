import { TraceMethod as SentryTraceMethod } from '@sentry/angular';

export function TraceMethod(): MethodDecorator {
	return SentryTraceMethod();
}
