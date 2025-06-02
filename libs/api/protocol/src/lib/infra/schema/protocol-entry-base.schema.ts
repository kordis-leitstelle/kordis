import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseDocument } from '@kordis/api/shared';

import {
	ProducerDocument,
	ProducerDocuments,
	ProducerType,
	SystemProducerSchema,
	UserProducerSchema,
} from './producer-partial.schema';
import { ProtocolEntryType } from './protocol-entry-type.enum';
import {
	RegisteredUnitSchema,
	UnitDocument,
	UnitDocuments,
	UnitType,
	UnknownUnitSchema,
} from './unit-partial.schema';

@Schema({ _id: false })
export class CommunicationDetailsDocument {
	@Prop({ type: UnitDocument })
	@AutoMap()
	sender: UnitDocuments;

	@Prop({ type: UnitDocument })
	@AutoMap()
	recipient: UnitDocuments;

	@Prop()
	@AutoMap()
	channel: string;
}

@Schema({
	timestamps: true,
	collection: 'protocol-entries',
	discriminatorKey: 'type',
})
export class ProtocolEntryBaseDocument extends BaseDocument {
	type: ProtocolEntryType;

	@Prop()
	@AutoMap()
	communicationDetails: CommunicationDetailsDocument;

	@Prop()
	@AutoMap()
	time: Date;

	@Prop()
	@AutoMap()
	searchableText: string;

	@Prop({ type: ProducerDocument })
	producer: ProducerDocuments;

	@Prop(() => String)
	@AutoMap(() => String)
	referenceId?: string;

	// for convenience, check base entity for more information
	payload: unknown;
}

export const ProtocolEntryBaseSchema = SchemaFactory.createForClass(
	ProtocolEntryBaseDocument,
);

const senderPath =
	ProtocolEntryBaseSchema.path<MongooseSchema.Types.Subdocument>(
		'communicationDetails.sender',
	);
senderPath.discriminator(UnitType.REGISTERED_UNIT, RegisteredUnitSchema);
senderPath.discriminator(UnitType.UNKNOWN_UNIT, UnknownUnitSchema);

const recipientPath =
	ProtocolEntryBaseSchema.path<MongooseSchema.Types.Subdocument>(
		'communicationDetails.recipient',
	);
recipientPath.discriminator(UnitType.REGISTERED_UNIT, RegisteredUnitSchema);
recipientPath.discriminator(UnitType.UNKNOWN_UNIT, UnknownUnitSchema);

const producerPath =
	ProtocolEntryBaseSchema.path<MongooseSchema.Types.Subdocument>('producer');
producerPath.discriminator(ProducerType.USER_PRODUCER, UserProducerSchema);
producerPath.discriminator(ProducerType.SYSTEM_PRODUCER, SystemProducerSchema);

ProtocolEntryBaseSchema.index({ orgId: 1, time: 1 }, { unique: false });
ProtocolEntryBaseSchema.index({ orgId: 1, referenceId: 1 }, { unique: false });
