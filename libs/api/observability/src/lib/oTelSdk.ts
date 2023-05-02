import {
	NoopOTelSDKFactory,
	OTelSDKFactory,
	SentryOTelSDKFactory,
} from './otel.factory';

const sdkFactory: OTelSDKFactory =
	process.env.NODE_ENV === 'production'
		? new SentryOTelSDKFactory()
		: new NoopOTelSDKFactory();
const oTelSDK = sdkFactory.makeSdk();

export default oTelSDK;
