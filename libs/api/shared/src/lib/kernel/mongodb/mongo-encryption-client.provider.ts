import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoEncryptionClientProvider {
	private keyId?: mongoose.mongo.UUID;
	private encryptionClient?: mongoose.mongo.ClientEncryption;

	async init(
		uri: string,
		provider: mongoose.mongo.ClientEncryptionDataKeyProvider,
		keyVaultNamespace: string,
		kmsProviders: mongoose.mongo.AutoEncryptionOptions['kmsProviders'],
		masterKey: mongoose.mongo.ClientEncryptionCreateDataKeyProviderOptions['masterKey'],
	): Promise<void> {
		const conn = await mongoose
			.createConnection(uri, {
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders,
					bypassAutoEncryption: true,
				},
			})
			.asPromise();

		this.encryptionClient = new mongoose.mongo.ClientEncryption(
			conn.getClient(),
			{
				keyVaultNamespace,
				kmsProviders,
			},
		);

		this.keyId = await this.encryptionClient.createDataKey(provider, {
			masterKey,
		});
	}

	getClient(): mongoose.mongo.ClientEncryption {
		if (!this.encryptionClient) {
			throw new Error('Client is not ready yet!');
		}

		return this.encryptionClient;
	}

	getKeyId(): mongoose.mongo.UUID {
		if (!this.keyId) {
			throw new Error('Key ID is not ready yet!');
		}

		return this.keyId;
	}
}
