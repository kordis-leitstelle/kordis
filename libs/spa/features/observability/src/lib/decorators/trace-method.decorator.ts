import { TraceMethodDecorator } from '@sentry/angular-ivy';

export function TraceMethod(): MethodDecorator {
	return TraceMethodDecorator();
}
