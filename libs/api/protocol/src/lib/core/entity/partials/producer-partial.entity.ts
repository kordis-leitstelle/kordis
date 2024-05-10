import { AutoMap } from '@automapper/classes';
import { Field, ObjectType, createUnionType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class Producer {}

@ObjectType()
export class UserProducer extends Producer {
	@Field()
	@AutoMap()
	userId: string;

	@Field()
	@AutoMap()
	firstName: string;

	@Field()
	@AutoMap()
	lastName: string;
}

@ObjectType()
export class SystemProducer extends Producer {
	@Field()
	@AutoMap()
	name: string;
}

export const ProducerUnion = createUnionType({
	name: 'ProducerUnion',
	types: () => [SystemProducer, UserProducer] as const,
});
