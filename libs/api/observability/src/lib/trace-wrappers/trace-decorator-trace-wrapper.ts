import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { SPAN_ACTIVE, TRACE_NAME } from '../decorators/trace.decorator';
import { TraceWrapper } from './abstract-trace-wrapper';

/**
 * Wraps all Methods of Providers with OpenTelemetry spans that are marked with the `Trace` decorator
 */
export class TraceDecoratorTraceWrapper extends TraceWrapper {
	constructor(modulesContainer: ModulesContainer) {
		super(modulesContainer);
	}

	wrapWithSpans(): void {
		for (const provider of this.getProviders()) {
			for (const traceMethod of this.getTraceMethods(provider)) {
				provider.metatype.prototype[traceMethod.methodName] = this.asWrapped(
					provider.metatype.prototype[traceMethod.methodName],
					`${provider.name} (Provider) -> ${traceMethod.methodName}${
						traceMethod.traceName ? ` (${traceMethod.traceName})` : ''
					}`,
					{
						provider: provider.name,
						method: traceMethod.methodName,
						...(traceMethod.traceName
							? { traceName: traceMethod.traceName }
							: {}),
					},
				);
			}
		}
	}

	private getTraceMethods(
		provider: InstanceWrapper,
	): { methodName: string; traceName?: string }[] {
		const methods = this.getFilteredMethodNames(provider.metatype.prototype);
		const traceMethods = [];

		for (const methodName of methods) {
			const spanActive = Boolean(
				Reflect.getMetadata(
					SPAN_ACTIVE,
					provider.metatype.prototype[methodName],
				),
			);
			if (!spanActive) {
				continue;
			}

			const traceName = Reflect.getMetadata(
				TRACE_NAME,
				provider.metatype.prototype[methodName],
			);
			traceMethods.push({ methodName, traceName });
		}

		return traceMethods;
	}
}
