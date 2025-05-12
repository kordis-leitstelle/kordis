import { ModulesContainer } from '@nestjs/core';

import { TraceWrapper } from './abstract-trace-wrapper';

/**
 * Wraps all NestJS Interceptors `intercept` methods with OpenTelemetry spans
 */
export class InterceptorTraceWrapper extends TraceWrapper {
	constructor(modulesContainer: ModulesContainer) {
		super(modulesContainer);
	}

	wrapWithSpans(): void {
		for (const provider of this.getProviders()) {
			if (
				provider.subtype === 'interceptor' &&
				provider.name !== 'SentryOTelUserContextInterceptor'
			) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				provider.metatype!.prototype['intercept'] = this.asWrapped(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					provider.metatype!.prototype['intercept'],
					`${provider.name} (Interceptor)`,
					{
						interceptor: provider.name,
					},
				);
			}
		}
	}
}
