import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BaseModel } from './base-entity.model';

export class BaseDocument extends Document implements BaseModel {
	@Prop({ index: true })
	@AutoMap()
	orgId: string;

	@Prop()
	@AutoMap()
	createdAt: Date;

	@Prop()
	@AutoMap()
	updatedAt: Date;

	constructor() {
		super();
		this.schema.pre('save', function (next) {
			const savedAt = new Date();
			if (this.isNew) {
				this.createdAt = savedAt;
			}
			this.updatedAt = savedAt;
			next();
		});
	}
}
