import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { BaseModel } from './base-entity.model';

export class BaseDocument implements BaseModel, Pick<Document, '_id'> {
	_id?: Types.ObjectId;

	@Prop({ index: true })
	@AutoMap()
	orgId: string;

	@Prop()
	@AutoMap({ isGetterOnly: true })
	createdAt: Date;

	@Prop()
	@AutoMap({ isGetterOnly: true })
	updatedAt: Date;
}
