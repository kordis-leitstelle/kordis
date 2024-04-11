import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { BaseModel } from './base-entity.model';

export abstract class BaseDocument extends Document implements BaseModel {
	@Prop()
	createdAt: Date;

	@Prop()
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
