import { ModulesContainer } from '@nestjs/core';

import {
	InterceptorTraceWrapper,
	ResolverTraceWrapper,
	TraceDecoratorTraceWrapper,
	TraceWrapper,
} from './trace-wrappers';

// this has to be called from a NestJS import (main.ts or any provider/module) context, otherwise prototypes are not correctly patched
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
