import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PressureTendency {
	@Field()
	phrase: string;
	@Field()
	iconFileName: string;
}

@ObjectType()
export class Pressure {
	@Field()
	unit: string;
	@Field()
	tendency: PressureTendency;
	@Field()
	value: number;
}

@ObjectType()
export class ValueUnit {
	@Field()
	unit: string;
	@Field()
	value: number;
}

@ObjectType()
export class Beaufort {
	@Field()
	grade: number;
	@Field()
	description: string;
}

@ObjectType()
export class WindSpeed {
	@Field()
	beaufort: Beaufort;
	@Field()
	unit: string;
	@Field()
	value: number;
}

@ObjectType()
export class Wind {
	@Field()
	degreesDescription: string;
	@Field()
	degrees: number;
	@Field()
	speed: WindSpeed;
	@Field()
	gustSpeed: WindSpeed;
}

@ObjectType()
export class Visibility {
	@Field()
	unit: string;
	@Field()
	obstruction: string;
	@Field()
	value: number;
}

@ObjectType()
export class Precipitation {
	@Field()
	amount: ValueUnit;
	@Field()
	probability: number;
}
