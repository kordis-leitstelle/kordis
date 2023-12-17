import { MongoEncryptionClientProvider } from './mongo-encryption-client.provider';

jest.mock('mongoose', () => ({
	default: {
		createConnection: jest.fn().mockReturnValue({
			asPromise: jest.fn().mockResolvedValue({
				getClient: jest.fn().mockReturnValue({}),
			}),
		}),
		mongo: {
			ClientEncryption: jest.fn().mockImplementation(() => ({
				createDataKey: jest.fn().mockResolvedValue('someKeyId'),
			})),
		},
	},
}));

describe('MongoEncryptionClientProvider', () => {
	let mongoEncryptionClientProvider: MongoEncryptionClientProvider;

	beforeEach(() => {
		mongoEncryptionClientProvider = new MongoEncryptionClientProvider();
	});

	it('should initialize the encryption client and key ID', async () => {
		await mongoEncryptionClientProvider.init(
			'mongodb://localhost:27017/test',
			'azure',
			'test.namespace',
			{
				azure: {
					tenantId: 'tenant',
					clientId: 'client',
					clientSecret: 'secret',
				},
			},
			{ keyVaultEndpoint: 'endpoint', keyName: 'keyName' },
		);

		expect(mongoEncryptionClientProvider.getClient()).toBeDefined();
		expect(mongoEncryptionClientProvider.getKeyId()).toBe('someKeyId');
	});

	it('getClient should throw an error if the client is not ready', () => {
		expect(() => mongoEncryptionClientProvider.getClient()).toThrow(
			'Client is not ready yet!',
		);
	});

	it('getKeyId should throw an error if the key ID is not ready', () => {
		expect(() => mongoEncryptionClientProvider.getKeyId()).toThrow(
			'Key ID is not ready yet!',
		);
	});
});
