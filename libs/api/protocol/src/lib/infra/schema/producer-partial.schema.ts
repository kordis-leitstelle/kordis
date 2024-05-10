import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ProducerType {
	SYSTEM_PRODUCER = 'SYSTEM_PRODUCER',
	USER_PRODUCER = 'USER_PRODUCER',
}

@Schema({ _id: false, discriminatorKey: 'type' })
export class ProducerDocument {
	type: ProducerType;
}

@Schema({ _id: false })
export class UserProducerDocument extends ProducerDocument {
	override type = ProducerType.USER_PRODUCER;

	@Prop()
	@AutoMap()
	userId: string;

	@Prop()
	@AutoMap()
	firstName: string;

	@Prop()
	@AutoMap()
	lastName: string;
}

@Schema({ _id: false })
export class SystemProducerDocument extends ProducerDocument {
	override type = ProducerType.SYSTEM_PRODUCER;

	@Prop()
	@AutoMap()
	name: string;
}

export const UserProducerSchema =
	SchemaFactory.createForClass(UserProducerDocument);
export const SystemProducerSchema = SchemaFactory.createForClass(
	SystemProducerDocument,
);
