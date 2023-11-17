import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { MongoEncryptionClientProvider } from './mongo-encryption-client.provider';

const ENCR_ALGO = 'AEAD_AES_256_CBC_HMAC_SHA_512';

// This is specifically for MongoDB and will only be used in Infrastructure Repositories that have MongoDB as a dependency, therefore, no abstraction needed.
@Injectable()
export class MongoEncryptionService {
	constructor(
		private readonly encryptionClientProvider: MongoEncryptionClientProvider,
	) {}

	encrypt(
		value: string,
		encrType: 'Random' | 'Deterministic',
	): Promise<mongoose.mongo.Binary> {
		return this.encryptionClientProvider.getClient().encrypt(value, {
			keyId: this.encryptionClientProvider.getKeyId(),
			algorithm: `${ENCR_ALGO}-${encrType}`,
		});
	}
}
