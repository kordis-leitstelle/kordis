import { Types } from 'mongoose';

import { BaseModel } from '../../../libs/api/shared/src';

type OptionalId<T> = T & { _id?: Types.ObjectId };

export interface CollectionData<T = any> {
	collectionName: string;
	entries: OptionalId<T & Partial<BaseModel>>[];
}
