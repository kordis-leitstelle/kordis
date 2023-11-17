import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

type KMS = {
	keyVaultNamespace: string;
	kmsProviders: mongoose.mongo.AutoEncryptionOptions['kmsProviders'];
};

type MasterKey =
	| {
			keyVaultEndpoint: string;
			keyName: string;
	  }
	| undefined;

export function getMongoEncrKmsFromConfig(config: ConfigService): {
	kms: KMS;
	masterKey: MasterKey;
	provider: mongoose.mongo.ClientEncryptionDataKeyProvider;
} {
	const kmsProvider =
		config.get<mongoose.mongo.ClientEncryptionDataKeyProvider>(
			'MONGODB_ENCR_KMS_PROVIDER',
			'local',
		);

	let kms: KMS;
	let masterKey: MasterKey;
	if (kmsProvider === 'local') {
		kms = getDevKms();
		new Logger().warn(
			'LOCAL DEV ENCRYPTION USED FOR MONGODB. THIS IS NOT SECURE!',
		);
	} else {
		kms = {
			keyVaultNamespace: config.getOrThrow<string>('MONGODB_ENCR_KV_NAMESPACE'),
			kmsProviders: JSON.parse(
				config.getOrThrow<string>('MONGODB_ENCR_KMS_PROVIDER_CREDS'),
			) as mongoose.mongo.AutoEncryptionOptions['kmsProviders'],
		};
		masterKey = JSON.parse(
			config.getOrThrow<string>('MONGODB_ENCR_MASTER_KEY'),
		) as typeof masterKey;
	}

	return {
		kms,
		masterKey,
		provider: kmsProvider,
	};
}

// THIS SHOULD ONLY BE USED IN DEVELOPMENT ENVIRONMENTS. IN PRODUCTION USE A REAL KMS.
function getDevKms(): {
	keyVaultNamespace: string;
	kmsProviders: { local: { key: Buffer } };
} {
	const arr = [];
	for (let i = 0; i < 96; ++i) {
		arr.push(i);
	}
	const key = Buffer.from(arr);
	const keyVaultNamespace = 'client.encryption';
	const kmsProviders = { local: { key } };

	return {
		keyVaultNamespace,
		kmsProviders,
	};
}
