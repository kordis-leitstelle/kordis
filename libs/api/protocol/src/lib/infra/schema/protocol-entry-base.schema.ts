import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseDocument } from '@kordis/api/shared';

import {
	ProducerDocument,
	ProducerType,
	SystemProducerSchema,
	UserProducerDocument,
	UserProducerSchema,
} from './producer-partial.schema';
import {
	RegisteredUnitSchema,
	UnitDocument,
	UnitType,
	UnknownUnitSchema,
} from './unit-partial.schema';

export enum ProtocolEntryType {
	COMMUNICATION_MESSAGE_ENTRY = 'COMMUNICATION_MESSAGE_ENTRY',
	// UNIT_STATUS_ENTRY = 'UNIT_STATUS_ENTRY',
	// RESCUE_STATION_SIGN_ON_ENTRY = 'RESCUE_STATION_SIGN_ON_ENTRY',
	// RESCUE_STATION_UPDATE_ENTRY = 'RESCUE_STATION_UPDATE_ENTRY',
	// RESCUE_STATION_SIGN_OFF_ENTRY = 'RESCUE_STATION_SIGN_OFF_ENTRY',
	// OPERATION_STARTED_ENTRY = 'OPERATION_STARTED_ENTRY',
	// OPERATION_ENDED_ENTRY = 'OPERATION_ENDED_ENTRY',
	// OPERATION_UNITS_UPDATED_ENTRY = 'OPERATION_UNITS_UPDATED_ENTRY',
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
	time: Date;

	@Prop()
	@AutoMap()
	sender: UnitDocument;

	@Prop()
	@AutoMap()
	searchableText: string;

	@Prop()
	@AutoMap()
	producer: ProducerDocument;
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

@Schema()
export class ProtocolCommunicationEntryBase extends ProtocolEntryBaseDocument {
	@Prop()
	@AutoMap()
	recipient: UnitDocument;

	@Prop()
	@AutoMap()
	override producer: UserProducerDocument;

	@Prop()
	@AutoMap()
	channel: string;
}

export const ProtocolCommunicationEntryBaseSchema =
	SchemaFactory.createForClass(ProtocolCommunicationEntryBase);
const recipientPath =
	ProtocolCommunicationEntryBaseSchema.path<MongooseSchema.Types.Subdocument>(
		'recipient',
	);
recipientPath.discriminator(UnitType.REGISTERED_UNIT, RegisteredUnitSchema);
recipientPath.discriminator(UnitType.UNKNOWN_UNIT, UnknownUnitSchema);
