import { MongoEncryptionService } from './mongo-encryption.service';
import { MongoEncryptionClientProvider } from './mongo-encryption-client.provider';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('MongoEncryptionService', () => {
	let mongoEncryptionService: MongoEncryptionService;
	let mockEncryptionClientProvider: DeepMocked<MongoEncryptionClientProvider>;

	beforeEach(() => {
		mockEncryptionClientProvider = createMock<MongoEncryptionClientProvider>();
		mongoEncryptionService = new MongoEncryptionService(
			mockEncryptionClientProvider,
		);
	});

	it('should encrypt data correctly with Random encryption type', async () => {
		const testValue = 'testValue';
		const encryptedValue = Buffer.from('encryptedData');

		mockEncryptionClientProvider.getClient.mockReturnValue({
			encrypt: jest.fn().mockResolvedValue(encryptedValue),
		} as any);
		mockEncryptionClientProvider.getKeyId.mockReturnValue(
			Buffer.alloc(16) as any,
		);

		const result = await mongoEncryptionService.encrypt(testValue, 'Random');

		expect(result).toBe(encryptedValue);
		expect(
			mockEncryptionClientProvider.getClient().encrypt,
		).toHaveBeenCalledWith(testValue, {
			keyId: expect.any(Buffer),
			algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
		});
	});

	it('should encrypt data correctly with Deterministic encryption type', async () => {
		const testValue = 'testValue';
		const encryptedValue = Buffer.from('encryptedData');
		mockEncryptionClientProvider.getClient.mockReturnValue({
			encrypt: jest.fn().mockResolvedValue(encryptedValue),
		} as any);
		mockEncryptionClientProvider.getKeyId.mockReturnValue(
			Buffer.alloc(16) as any,
		);

		const result = await mongoEncryptionService.encrypt(
			testValue,
			'Deterministic',
		);

		expect(result).toBe(encryptedValue);
		expect(
			mockEncryptionClientProvider.getClient().encrypt,
		).toHaveBeenCalledWith(testValue, {
			keyId: expect.any(Buffer),
			algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
		});
	});
});
