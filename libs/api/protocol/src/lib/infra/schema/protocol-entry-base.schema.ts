import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseDocument } from '@kordis/api/shared';

import {
	ProducerDocument,
	ProducerDocuments,
	ProducerType,
	SystemProducerSchema,
	UserProducerDocument,
	UserProducerSchema,
} from './producer-partial.schema';
import { ProtocolEntryType } from './protocol-entry-type';
import {
	RegisteredUnitSchema,
	UnitDocument,
	UnitDocuments,
	UnitType,
	UnknownUnitSchema,
} from './unit-partial.schema';

@Schema({
	timestamps: true,
	collection: 'protocol-entries',
	discriminatorKey: 'type',
})
export class ProtocolEntryBaseDocument extends BaseDocument {
	type: ProtocolEntryType;

	@Prop()
	@AutoMap()
	time: Date;

	@Prop({ type: UnitDocument })
	sender: UnitDocuments;

	@Prop()
	@AutoMap()
	searchableText: string;

	@Prop({ type: ProducerDocument })
	producer: ProducerDocuments;
}

export const ProtocolEntryBaseSchema = SchemaFactory.createForClass(
	ProtocolEntryBaseDocument,
);

const senderPath =
	ProtocolEntryBaseSchema.path<MongooseSchema.Types.Subdocument>('sender');
senderPath.discriminator(UnitType.REGISTERED_UNIT, RegisteredUnitSchema);
senderPath.discriminator(UnitType.UNKNOWN_UNIT, UnknownUnitSchema);

const producerPath =
	ProtocolEntryBaseSchema.path<MongooseSchema.Types.Subdocument>('producer');
producerPath.discriminator(ProducerType.USER_PRODUCER, UserProducerSchema);
producerPath.discriminator(ProducerType.SYSTEM_PRODUCER, SystemProducerSchema);

ProtocolEntryBaseSchema.index({ orgId: 1, time: 1 }, { unique: false });

@Schema()
export class ProtocolMessageEntryBaseDocument extends ProtocolEntryBaseDocument {
	@Prop({ type: UnitDocument })
	@AutoMap()
	recipient: UnitDocuments;

	@Prop()
	@AutoMap()
	channel: string;

	@Prop()
	declare producer: UserProducerDocument;
}

export const ProtocolMessageEntryBaseSchema = SchemaFactory.createForClass(
	ProtocolMessageEntryBaseDocument,
);
const recipientPath =
	ProtocolMessageEntryBaseSchema.path<MongooseSchema.Types.Subdocument>(
		'recipient',
	);
recipientPath.discriminator(UnitType.REGISTERED_UNIT, RegisteredUnitSchema);
recipientPath.discriminator(UnitType.UNKNOWN_UNIT, UnknownUnitSchema);
