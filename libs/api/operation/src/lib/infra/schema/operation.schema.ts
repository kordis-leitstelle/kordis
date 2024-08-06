import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { mongo } from 'mongoose';

import {
	BaseDocument,
	Coordinate,
	CoordinatesSchema,
} from '@kordis/api/shared';

import { OperationProcessState } from '../../core/entity/operation-process-state.enum';


@Schema({ _id: false })
export class OperationAddressDocument {
	@AutoMap()
	@Prop({ default: '' })
	name: string;

	@AutoMap()
	@Prop({ default: '' })
	street: string;

	@AutoMap()
	@Prop({ default: '' })
	city: string;

	@AutoMap()
	@Prop({ default: '' })
	postalCode: string;
}

export const OperationAddressSchema = SchemaFactory.createForClass(
	OperationAddressDocument,
);

@Schema({ _id: false })
export class OperationLocationDocument {
	@AutoMap(() => Coordinate)
	@Prop({ type: CoordinatesSchema })
	coordinate: Coordinate;

	@AutoMap()
	@Prop({ type: OperationAddressSchema })
	address: OperationAddressDocument;
}

export const OperationLocationSchema = SchemaFactory.createForClass(
	OperationLocationDocument,
);

@Schema({ _id: false })
export class OperationCategoryDocument {
	@AutoMap()
	@Prop()
	name: string;

	@AutoMap()
	@Prop()
	count: number;

	@AutoMap()
	@Prop()
	patientCount: number;

	@AutoMap()
	@Prop()
	dangerousSituationCount: number;

	@AutoMap()
	@Prop()
	wasDangerous: boolean;
}

export const OperationCategorySchema = SchemaFactory.createForClass(
	OperationCategoryDocument,
);

// this is not a schema as it just describes the structure of the patient which is encrypted in the db, therefore no decorators necessary
export class OperationPatientDocument {
	@AutoMap()
	firstName: string;

	@AutoMap()
	lastName: string;

	@AutoMap()
	birthDate: Date;

	@AutoMap()
	phoneNumber: string;

	@AutoMap()
	whereabouts: string;

	@AutoMap(() => OperationAddressDocument)
	address: Omit<OperationAddressDocument, 'name'>;
}

@Schema({ timestamps: true, collection: 'operations' })
export class OperationDocument extends BaseDocument {
	@AutoMap()
	@Prop({ enum: OperationProcessState, type: String })
	processState: OperationProcessState;

	@AutoMap()
	@Prop()
	createdByUserId: string;

	@AutoMap()
	@Prop()
	sign: string;

	@AutoMap(() => Date)
	@Prop({ type: Date })
	start: Date;

	@AutoMap(() => Date)
	@Prop({ default: null, type: Date })
	end: Date | null;

	@AutoMap()
	@Prop({ default: '' })
	commander: string;

	@AutoMap()
	@Prop({ default: '' })
	reporter: string;

	@AutoMap()
	@Prop({ default: '' })
	alarmKeyword: string;

	@AutoMap()
	@Prop({ default: '' })
	description: string;

	@AutoMap()
	@Prop({ default: '' })
	externalReference: string;

	@AutoMap(() => OperationLocationDocument)
	@Prop({ type: OperationLocationSchema })
	location: OperationLocationDocument;

	@AutoMap(() => [OperationCategoryDocument])
	@Prop({ type: [OperationCategorySchema] })
	categories: OperationCategoryDocument[];

	@AutoMap(() => [OperationPatientDocument])
	@Prop({ type: [mongo.Binary] })
	patients: OperationPatientDocument[];
}

export const OperationSchema = SchemaFactory.createForClass(OperationDocument);
OperationSchema.index({ orgId: 1, sign: 1 }, { unique: true });
OperationSchema.index({ orgId: 1, start: 1 });
OperationSchema.index({ orgId: 1, end: 1 });
