import { AutoMap } from '@automapper/classes';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsDate, IsMongoId, IsString, ValidateIf } from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

import { ProducerUnion } from '../partials/producer-partial.entity';
import { UnitUnion } from '../partials/unit-partial.entity';

export enum ProtocolEntryMessageType {
	COMMUNICATION = 'COMMUNICATION',
	LOG = 'LOG',
}

registerEnumType(ProtocolEntryMessageType, {
	name: 'ProtocolEntryMessageType',
});

@ObjectType({ isAbstract: true })
export class CommunicationDetails {
	@Field(() => UnitUnion)
	sender: typeof UnitUnion;

	@Field(() => UnitUnion)
	recipient: typeof UnitUnion;

	@Field()
	@AutoMap()
	channel: string;
}

@ObjectType({ isAbstract: true })
export class ProtocolEntryBase extends BaseEntityModel {
	@Field(() => CommunicationDetails, { nullable: true })
	@AutoMap(() => CommunicationDetails)
	communicationDetails: CommunicationDetails | null;

	@Field()
	@AutoMap()
	@IsDate()
	time: Date;

	@Field()
	@AutoMap()
	@IsString()
	searchableText: string;

	@Field(() => ProducerUnion)
	@AutoMap()
	producer: typeof ProducerUnion;

	@Field(() => String, {
		description:
			'The id of the related entity (e.g. operation, unit...) which is the subject of the protocol entry',
		nullable: true,
	})
	@AutoMap(() => String)
	@ValidateIf((o) => o.referenceId != null)
	@IsMongoId()
	referenceId?: string;

	// this is for convenience, we simplify the mapping of each protocol entry by just having mappers for the payloads. As mongo and graphql are not very good with generics and we cannot use abstract classes due to the mapper and graphql schema generator, we have to use this workaround
	payload: unknown;
}
