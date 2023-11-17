import { getMongoEncrKmsFromConfig } from './kms.helper'; // Update the path as needed
import { ConfigService } from '@nestjs/config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('getMongoEncrKmsFromConfig', () => {
	let configService: DeepMocked<ConfigService>;

	beforeEach(() => {
		configService = createMock<ConfigService>();
	});

	it('should use client key when kmsProvider is local', () => {
		jest.spyOn(configService, 'get').mockReturnValue('local');

		const result = getMongoEncrKmsFromConfig(configService);

		expect(result.kms).toEqual({
			keyVaultNamespace: 'client.encryption',
			kmsProviders: {
				local: {
					key: Buffer.from([
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
						19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
						36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
						53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
						70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
						87, 88, 89, 90, 91, 92, 93, 94, 95,
					]),
				},
			},
		});
	});

	it('should use provided configuration when kmsProvider is not local', () => {
		const fakeConfig = {
			keyVaultNamespace: 'test.namespace',
			kmsProviders: {
				azure: {
					tenantId: 'tenant',
					clientId: 'client',
					clientSecret: 'secret',
				},
			},
			masterKey: { keyVaultEndpoint: 'endpoint', keyName: 'keyName' },
		};

		jest.spyOn(configService, 'get').mockImplementation((key) => {
			if (key === 'MONGODB_ENCR_KMS_PROVIDER') return 'azure';

			return null;
		});
		jest.spyOn(configService, 'getOrThrow').mockImplementation((key) => {
			if (key === 'MONGODB_ENCR_KV_NAMESPACE')
				return fakeConfig.keyVaultNamespace;
			if (key === 'MONGODB_ENCR_KMS_PROVIDERS')
				return JSON.stringify(fakeConfig.kmsProviders);
			if (key === 'MONGODB_ENCR_MASTER_KEY')
				return JSON.stringify(fakeConfig.masterKey);
			return null;
		});

		const result = getMongoEncrKmsFromConfig(configService);

		expect(result.kms).toEqual({
			keyVaultNamespace: fakeConfig.keyVaultNamespace,
			kmsProviders: fakeConfig.kmsProviders,
		});
		expect(result.masterKey).toEqual(fakeConfig.masterKey);
		expect(result.provider).toEqual('azure');
	});

	it('should throw an error when necessary configuration is missing', () => {
		jest.spyOn(configService, 'get').mockReturnValue('azure');

		expect(() => getMongoEncrKmsFromConfig(configService)).toThrow();
	});
});
