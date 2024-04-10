import { Injectable } from '@nestjs/common';
import { createConnection, mongo } from 'mongoose';

@Injectable()
export class MongoEncryptionClientProvider {
	private keyId?: mongo.UUID;
	private encryptionClient?: mongo.ClientEncryption;

	async init(
		uri: string,
		provider: mongo.ClientEncryptionDataKeyProvider,
		keyVaultNamespace: string,
		kmsProviders: mongo.AutoEncryptionOptions['kmsProviders'],
		masterKey: mongo.ClientEncryptionCreateDataKeyProviderOptions['masterKey'],
	): Promise<void> {
		const conn = await createConnection(uri, {
			autoEncryption: {
				keyVaultNamespace,
				kmsProviders,
				bypassAutoEncryption: true,
			},
		}).asPromise();

		this.encryptionClient = new mongo.ClientEncryption(conn.getClient(), {
			keyVaultNamespace,
			kmsProviders,
		});

		this.keyId = await this.encryptionClient.createDataKey(provider, {
			masterKey,
		});
	}

	getClient(): mongo.ClientEncryption {
		if (!this.encryptionClient) {
			throw new Error('Client is not ready yet!');
		}

		return this.encryptionClient;
	}

	getKeyId(): mongo.UUID {
		if (!this.keyId) {
			throw new Error('Key ID is not ready yet!');
		}

		return this.keyId;
	}
}
