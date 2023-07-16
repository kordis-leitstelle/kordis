import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BaseModel } from './base-entity.model';

export abstract class BaseDocument extends Document implements BaseModel {
	@Prop()
	@AutoMap()
	readonly createdAt: Date;

	@Prop()
	@AutoMap()
	readonly updatedAt: Date;
}
