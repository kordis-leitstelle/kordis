import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { BaseModel } from './base-entity.model';

export class BaseDocument implements BaseModel, Pick<Document, '_id'> {
	@AutoMap()
	_id?: Types.ObjectId;

	@Prop({ index: true })
	@AutoMap()
	orgId: string;

	@Prop()
	@AutoMap()
	createdAt: Date;

	@Prop()
	@AutoMap()
	updatedAt: Date;
}
