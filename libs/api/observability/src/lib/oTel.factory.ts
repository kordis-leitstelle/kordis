import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
	SentryPropagator,
	SentrySpanProcessor,
} from '@sentry/opentelemetry-node';

export abstract class OTelSDKFactory {
	protected readonly defaultInstrumentations = [
		new GraphQLInstrumentation(),
		new MongooseInstrumentation(),
		new PinoInstrumentation(),
	] as const;
	protected readonly serviceName = 'kordis-api';

	abstract makeSdk(): NodeSDK;
}

export class SentryOTelSDKFactory extends OTelSDKFactory {
	makeSdk(): NodeSDK {
		return new NodeSDK({
			traceExporter: new OTLPTraceExporter(),
			instrumentations: [...this.defaultInstrumentations],
			spanProcessor: new SentrySpanProcessor(),
			textMapPropagator: new SentryPropagator(),
			serviceName: this.serviceName,
		});
	}
}

export class NoopOTelSDKFactory extends OTelSDKFactory {
	makeSdk(): NodeSDK {
		return {
			start: () => {
				// noop
			},
		} as NodeSDK;
	}
}
