import { AutoMap } from '@automapper/classes';
import { Field, InputType, ObjectType, createUnionType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class Unit {}

@ObjectType()
@InputType('RegisteredUnitInput')
export class RegisteredUnit extends Unit {
	@Field()
	@AutoMap()
	id: string;
}

@ObjectType()
@InputType('UnknownUnitInput')
export class UnknownUnit extends Unit {
	@Field()
	@AutoMap()
	name: string;
}

export const UnitUnion = createUnionType({
	name: 'UnitUnion',
	types: () => [RegisteredUnit, UnknownUnit] as const,
});
