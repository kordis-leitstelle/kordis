import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

import {
	ProducerUnion,
	UserProducer,
} from '../partials/producer-partial.entity';
import { UnitUnion } from '../partials/unit-partial.entity';

@ObjectType({ isAbstract: true })
export class ProtocolEntryBase extends BaseEntityModel {
	@Field()
	@AutoMap()
	time: Date;

	@Field(() => UnitUnion)
	@AutoMap()
	sender: typeof UnitUnion;

	@Field()
	@AutoMap()
	searchableText: string;

	@Field(() => ProducerUnion)
	@AutoMap()
	producer: typeof ProducerUnion;
}

@ObjectType({ isAbstract: true })
export class ProtocolMessageEntryBase extends ProtocolEntryBase {
	@Field(() => UnitUnion)
	@AutoMap()
	recipient: typeof UnitUnion;

	@Field()
	@AutoMap()
	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	channel: string;

	@Field(() => UserProducer)
	@AutoMap()
	declare producer: UserProducer;
}
