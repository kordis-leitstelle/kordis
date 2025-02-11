# MongoDB

## Encryption

We use
[Field Level Encryption (CSFLE)](https://www.mongodb.com/docs/manual/core/csfle/),
a feature provided natively by MongoDB to encrypt fields in a collection. This
feature is available in MongoDB 7 and above. Since we use the MongoDB community
edition, we can not use the completely automated encryption process. We have to
explicitly encrypt values before inserting/changing them. Make sure, that you
set the `type` in the decorator to `mongo.Binary` for the encrypted field in
your schema, the actual property type should reflect the type of the decrypted
value.

You can use the [`MongoEncryptionService`](./mongo-encryption.service.ts) to
encrypt the value:

```ts
const encryptedResult = await mongoEncryptionService.encrypt(
	unencrptedValue,
	'Random',
);
await model.insert({ someKey: encryptedResult });
```

Pass `Random` as encryption algo to receive a different value for every
encryption, even if the value is the same. `Deterministic` will return the same
encrypted value, therefore you can only query an exact match for
deterministically encrypted values by encrypting the query term and using it in
an `$eq` query. Thus, `Deterministic` will only work for primitive data types.

Decrypting is done automatically by MongoDB, so every operation **after
initially creating the document** returns the decrypted result!
