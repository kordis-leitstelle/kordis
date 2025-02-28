import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { BaseModel } from './base-entity.model';

export class BaseDocument implements BaseModel {
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
