import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsInt,
	IsLatitude,
	IsLongitude,
	IsNotEmpty,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';

import { Validatable } from '@kordis/api/shared';
import { UnitViewModel } from '@kordis/api/unit';

import { BaseDeploymentEntity } from './deployment.entity';

@ObjectType()
export class RescueStationStrength extends Validatable {
	@Field()
	@IsInt()
	@Min(0)
	@AutoMap()
	leaders: number;

	@Field()
	@IsInt()
	@Min(0)
	@AutoMap()
	subLeaders: number;

	@Field()
	@IsInt()
	@Min(0)
	@AutoMap()
	helpers: number;

	static makeDefault(): RescueStationStrength {
		const strength = new RescueStationStrength();
		strength.leaders = 0;
		strength.subLeaders = 0;
		strength.helpers = 0;
		return strength;
	}
}

@ObjectType()
export class RescueStationCoordinates {
	@Field()
	@IsLatitude()
	@AutoMap()
	lat: number;

	@Field()
	@IsLongitude()
	@AutoMap()
	lon: number;
}

@ObjectType()
export class RescueStationAddress {
	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	street: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	city: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	@AutoMap()
	postalCode: string;
}

@ObjectType()
export class RescueStationLocation {
	@Field(() => RescueStationCoordinates)
	@ValidateNested()
	@Type(() => RescueStationCoordinates)
	@AutoMap()
	coordinates: RescueStationCoordinates;

	@Field(() => RescueStationAddress)
	@ValidateNested()
	@Type(() => RescueStationAddress)
	@AutoMap()
	address: RescueStationAddress;
}

@ObjectType({ isAbstract: true })
export class RescueStationDeploymentEntity extends BaseDeploymentEntity {
	@Field(() => RescueStationStrength)
	@ValidateNested()
	@Type(() => RescueStationStrength)
	@AutoMap()
	strength: RescueStationStrength;

	@Field()
	@IsString()
	@AutoMap()
	note: string;

	@Field()
	@IsBoolean()
	@AutoMap()
	signedIn: boolean;

	@Field(() => RescueStationLocation)
	@ValidateNested()
	@Type(() => RescueStationLocation)
	@AutoMap()
	location: RescueStationLocation;

	@Field(() => [UnitViewModel])
	@ValidateNested({ each: true })
	@Type(() => UnitViewModel)
	@AutoMap()
	defaultUnits: { id: string }[];
}
