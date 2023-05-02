import { ModulesContainer } from '@nestjs/core';

import {
	InterceptorTraceWrapper,
	ResolverTraceWrapper,
	TraceDecoratorTraceWrapper,
	TraceWrapper,
} from './trace-wrappers';

export function wrapProvidersWithTracingSpans(
	modulesContainer: ModulesContainer,
): void {
	const wrappers: TraceWrapper[] = [
		new ResolverTraceWrapper(modulesContainer),
		new TraceDecoratorTraceWrapper(modulesContainer),
		new InterceptorTraceWrapper(modulesContainer),
	];

	for (const wrapper of wrappers) {
		wrapper.wrapWithSpans();
	}
}
