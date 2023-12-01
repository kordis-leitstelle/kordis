import type { OTelSDKFactory } from './oTel.factory';
import { NoopOTelSDKFactory, SentryOTelSDKFactory } from './oTel.factory';

/**
 * this file has to be the first import of the bootstrap file! otherwise the oTel sdk will not be initialized correctly.
 * The SDK has to be created as a first step, otherwise some instrumentations might not work!
 * This is why we have to check the environment and create a noop sdk when we are in a test environment.
 **/
const sdkFactory: OTelSDKFactory =
	process.env.NODE_ENV === 'production' && !process.env.GITHUB_ACTIONS
		? new SentryOTelSDKFactory()
		: new NoopOTelSDKFactory();
const oTelSDK = sdkFactory.makeSdk();

export default oTelSDK;
