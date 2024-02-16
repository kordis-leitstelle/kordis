import { Field, ObjectType, createUnionType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsDate,
	IsInt,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

export enum ProtocolEntryType {
	UNIT_STATUS = 'UNIT_STATUS',
	RESCUE_STATION_SIGN_ON = 'RESCUE_STATION_SIGN_ON',
	RESCUE_STATION_UPDATE = 'RESCUE_STATION_UPDATE', // Zordnung, Rauslösung, Statusänderung
	RESCUE_STATION_SIGN_OFF = 'RESCUE_STATION_SIGN_OFF',
	RADIO_CALL_MESSAGE = 'RADIO_CALL_MESSAGE',
	OPERATION_STARTED = 'OPERATION_STARTED',
	OPERATION_ENDED = 'OPERATION_ENDED',
	OPERATION_UNITS_UPDATED = 'OPERATION_UNITS_UPDATED', // Zuordnung von HH 12/42 ..., Rauslösung von HH 12/51 ..., von einsaznummer,
}

export abstract class ProtocolEntryPayload {
	abstract type: ProtocolEntryType;
}

export class UnitStatusEntryPayload extends ProtocolEntryPayload {
	type = ProtocolEntryType.UNIT_STATUS;
	@IsInt()
	status: number;
	@IsString()
	ric: string;
	@IsString()
	name: string;
}

export class RescueStationSignOnEntryPayload {}

export class RescueStationUpdateEntryPayload {}

export class RescueStationSignOffEntryPayload {}

export class RadioCallMessageEntryPayload {}

export class OperationStartedEntryPayload {}

export class OperationEndedEntryPayload {}

export class OperationUnitsUpdatedEntryPayload {}

export abstract class Producer {
	abstract type: 'system' | 'user';
}

@ObjectType()
export class UserProducer extends Producer {
	type: 'user';

	@IsString()
	userId: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;
}

export class SystemProducer extends Producer {
	type: 'system';

	@IsString()
	name: string;
}

export const ProducerUnion = createUnionType({
	name: 'ProducerUnion',
	types: () => [SystemProducer, UserProducer] as const,
});

export const ProtocolEntryPayloadUnion = createUnionType({
	name: 'ProtocolEntryPayloadUnion',
	types: () =>
		[
			UnitStatusEntryPayload,
			RescueStationSignOnEntryPayload,
			RescueStationUpdateEntryPayload,
			RescueStationSignOffEntryPayload,
			RadioCallMessageEntryPayload,
			OperationStartedEntryPayload,
			OperationEndedEntryPayload,
			OperationUnitsUpdatedEntryPayload,
		] as const,
});

export class ProtocolEntryEntity extends BaseEntityModel {
	@IsString()
	sender: string;

	@IsString()
	@ValidateIf((o) => o.recipient !== null)
	recipient: string | null;

	@IsDate()
	time: Date;

	@ValidateNested({ each: true })
	@Type(() => ProtocolEntryPayload, {
		keepDiscriminatorProperty: true,
		discriminator: {
			property: 'kind',
			subTypes: [
				{ value: UnitStatusEntryPayload, name: ProtocolEntryType.UNIT_STATUS },
				{
					value: RescueStationSignOnEntryPayload,
					name: ProtocolEntryType.RESCUE_STATION_SIGN_ON,
				},
				{
					value: RescueStationUpdateEntryPayload,
					name: ProtocolEntryType.RESCUE_STATION_UPDATE,
				},
				{
					value: RescueStationSignOffEntryPayload,
					name: ProtocolEntryType.RESCUE_STATION_SIGN_OFF,
				},
				{
					value: RadioCallMessageEntryPayload,
					name: ProtocolEntryType.RADIO_CALL_MESSAGE,
				},
				{
					value: OperationStartedEntryPayload,
					name: ProtocolEntryType.OPERATION_STARTED,
				},
				{
					value: OperationEndedEntryPayload,
					name: ProtocolEntryType.OPERATION_ENDED,
				},
				{
					value: OperationUnitsUpdatedEntryPayload,
					name: ProtocolEntryType.OPERATION_UNITS_UPDATED,
				},
			],
		},
	})
	payload: typeof ProtocolEntryPayloadUnion;

	@IsString()
	@ValidateNested({ each: true })
	@Type(() => Producer, {
		keepDiscriminatorProperty: true,
		discriminator: {
			property: 'kind',
			subTypes: [
				{ value: SystemProducer, name: 'system' },
				{ value: UserProducer, name: 'user' },
			],
		},
	})
	@Field(() => ProducerUnion)
	producer: typeof ProducerUnion;

	@IsString()
	searchableText: string;
}
