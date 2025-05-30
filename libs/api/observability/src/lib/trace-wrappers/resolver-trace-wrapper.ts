import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
	RESOLVER_NAME_METADATA,
	RESOLVER_TYPE_METADATA,
} from '@nestjs/graphql';

import { TraceWrapper } from './abstract-trace-wrapper';

/**
 * Wraps all NestJS Resolvers `Query` and `Mutation` methods with OpenTelemetry spans
 */
export class ResolverTraceWrapper extends TraceWrapper {
	constructor(modulesContainer: ModulesContainer) {
		super(modulesContainer);
	}

	wrapWithSpans(): void {
		for (const provider of this.getProviders()) {
			if (this.isResolver(provider)) {
				this.wrapResolver(provider);
			}
		}
	}

	private isResolver(provider: InstanceWrapper): boolean {
		const { instance } = provider;
		if (!instance) {
			return false;
		}

		const metadataKeys = Reflect.getMetadataKeys(instance.constructor);
		return metadataKeys.some(
			(key) => key === RESOLVER_TYPE_METADATA || key === RESOLVER_NAME_METADATA,
		);
	}

	private wrapResolver(provider: InstanceWrapper): void {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const methods = Object.getOwnPropertyNames(provider.metatype!.prototype);

		for (const methodName of methods) {
			if (methodName === 'constructor') {
				continue;
			}

			const type = Reflect.getMetadata(
				RESOLVER_TYPE_METADATA,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				provider.metatype!.prototype[methodName],
			);

			if (!type || (type !== 'Query' && type !== 'Mutation')) {
				continue;
			}
			/*  eslint-disable @typescript-eslint/no-non-null-assertion */
			provider.metatype!.prototype[methodName] = this.asWrapped(
				provider.metatype!.prototype[methodName],
				`${provider.metatype!.name} (Resolver) -> ${methodName} (${type})`,
				/* eslint-enable @typescript-eslint/no-non-null-assertion */
				{
					resolver: provider.name,
					method: methodName,
				},
			);
		}
	}
}
