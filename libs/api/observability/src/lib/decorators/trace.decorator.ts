import { SetMetadata } from '@nestjs/common';

export const SPAN_ACTIVE = Symbol('SPAN_ACTIVE');
export const TRACE_NAME = Symbol('TRACE_NAME');

// This will mark the method as a traceable method, meaning it will be proxied with a span. This only works in injected Providers!
export function Trace<T extends object>(traceName?: string) {
	return (target: T, propertyKey: string, descriptor: PropertyDescriptor) => {
		SetMetadata(SPAN_ACTIVE, true)(target, propertyKey, descriptor);
		if (traceName) {
			SetMetadata(TRACE_NAME, traceName)(target, propertyKey, descriptor);
		}
	};
}
