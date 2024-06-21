import { AutoMap } from '@automapper/classes';
import { Field, InputType, ObjectType, createUnionType } from '@nestjs/graphql';

import { UnitViewModel } from '@kordis/api/unit';

export type MessageUnit = RegisteredUnit | UnknownUnit;

@ObjectType({ isAbstract: true })
export abstract class Unit {}

@ObjectType()
@InputType('RegisteredUnitInput')
export class RegisteredUnit extends Unit {
	@Field(() => UnitViewModel)
	@AutoMap()
	unit: { id: string };
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
