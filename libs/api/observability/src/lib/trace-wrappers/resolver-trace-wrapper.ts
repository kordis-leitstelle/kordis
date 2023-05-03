import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
	RESOLVER_NAME_METADATA,
	RESOLVER_TYPE_METADATA,
} from '@nestjs/graphql';

import { TraceWrapper } from './abstract-trace-wrapper';

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
		const methods = Object.getOwnPropertyNames(provider.metatype.prototype);

		for (const methodName of methods) {
			if (methodName === 'constructor') {
				continue;
			}

			const type = Reflect.getMetadata(
				RESOLVER_TYPE_METADATA,
				provider.metatype.prototype[methodName],
			);

			if (!type || (type !== 'Query' && type !== 'Mutation')) {
				continue;
			}

			provider.metatype.prototype[methodName] = this.asWrapped(
				provider.metatype.prototype[methodName],
				`${provider.metatype.name} (Resolver) -> ${methodName} (${type})`,
				{
					resolver: provider.name,
					method: methodName,
				},
			);
		}
	}
}
