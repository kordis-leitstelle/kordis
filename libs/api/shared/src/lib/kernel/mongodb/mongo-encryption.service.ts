import { Injectable } from '@nestjs/common';
import { mongo } from 'mongoose';

import { MongoEncryptionClientProvider } from './mongo-encryption-client.provider';

const ENCR_ALGO = 'AEAD_AES_256_CBC_HMAC_SHA_512';

// This is specifically for MongoDB and will only be used in Infrastructure Repositories that have MongoDB as a dependency, therefore, no abstraction needed.
@Injectable()
export class MongoEncryptionService {
	constructor(
		private readonly encryptionClientProvider: MongoEncryptionClientProvider,
	) {}

	encrypt(
		value: unknown,
		encrType: 'Random' | 'Deterministic',
	): Promise<mongo.Binary> {
		return this.encryptionClientProvider.getClient().encrypt(value, {
			keyId: this.encryptionClientProvider.getKeyId(),
			algorithm: `${ENCR_ALGO}-${encrType}`,
		});
	}

	encryptArray(
		values: unknown[],
		encrType: 'Random' | 'Deterministic',
	): Promise<mongo.Binary[]> {
		return Promise.all(values.map((value) => this.encrypt(value, encrType)));
	}
}
