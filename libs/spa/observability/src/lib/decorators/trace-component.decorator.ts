import { TraceClassDecorator } from '@sentry/angular-ivy';

export function TraceComponent(): ClassDecorator {
	return TraceClassDecorator();
}
