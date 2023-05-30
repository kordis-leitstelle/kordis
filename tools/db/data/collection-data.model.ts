import { Types } from 'mongoose';

type OptionalId<T> = T & { _id?: Types.ObjectId };

export interface CollectionData<T = any> {
	collectionName: string;
	entries: OptionalId<T>[];
}
