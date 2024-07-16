import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UnitType {
	REGISTERED_UNIT = 'REGISTERED_UNIT',
	UNKNOWN_UNIT = 'UNKNOWN_UNIT',
}

@Schema({ _id: false, discriminatorKey: 'type' })
export class UnitDocument {
	type: UnitType;
}

@Schema({ _id: false })
export class RegisteredUnitDocument extends UnitDocument {
	override type = UnitType.REGISTERED_UNIT;

	@Prop()
	@AutoMap()
	unitId: string;
}

@Schema({ _id: false })
export class UnknownUnitDocument extends UnitDocument {
	override type = UnitType.UNKNOWN_UNIT;

	@Prop()
	@AutoMap()
	name: string;
}

export type UnitDocuments = RegisteredUnitDocument | UnknownUnitDocument;

export const RegisteredUnitSchema = SchemaFactory.createForClass(
	RegisteredUnitDocument,
);
export const UnknownUnitSchema =
	SchemaFactory.createForClass(UnknownUnitDocument);
