import {
	NoopOTelSDKFactory,
	OTelSDKFactory,
	SentryOTelSDKFactory,
} from './oTel.factory';

const sdkFactory: OTelSDKFactory =
	process.env.NODE_ENV === 'production' && !process.env.GITHUB_ACTIONS
		? new SentryOTelSDKFactory()
		: new NoopOTelSDKFactory();
const oTelSDK = sdkFactory.makeSdk();

export default oTelSDK;
