import { TraceClass } from '@sentry/angular';

export function TraceComponent(): ClassDecorator {
	return TraceClass();
}
