import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { trace } from '@opentelemetry/api';

export abstract class TraceWrapper {
	private readonly metadataScanner: MetadataScanner = new MetadataScanner();

	protected constructor(private readonly modulesContainer: ModulesContainer) {}

	abstract wrapWithSpans(): void;

	protected asWrapped(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		prototype: Record<any, any>,
		traceName: string,
		attributes = {},
	): unknown {
		const method = {
			[prototype.name]: function (...args: unknown[]) {
				const tracer = trace.getTracer('default');
				const currentSpan = tracer.startSpan(traceName);
				currentSpan.setAttributes(attributes);

				let hasAsyncResponse = false;

				try {
					const res = prototype.apply(this, args);
					if (res instanceof Promise) {
						hasAsyncResponse = true;
						return res.finally(() => currentSpan.end());
					}
					return res;
				} finally {
					if (!hasAsyncResponse) {
						currentSpan.end();
					}
				}
			},
		}[prototype.name];

		// decorate with metadata from original method implementation
		const keys = Reflect.getMetadataKeys(prototype);

		for (const key of keys) {
			const meta = Reflect.getMetadata(key, prototype);
			Reflect.defineMetadata(key, meta, method);
		}

		return method;
	}

	protected *getProviders(): Generator<InstanceWrapper, void, unknown> {
		for (const module of this.modulesContainer.values()) {
			for (const provider of module.providers.values()) {
				if (provider?.metatype?.prototype) {
					yield provider;
				}
			}
		}
	}

	protected getFilteredMethodNames(prototype: object): string[] {
		return this.metadataScanner.getAllMethodNames(prototype);
	}
}
