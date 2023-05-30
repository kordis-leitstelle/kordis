import { ArgsType, Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsLatitude,
	IsLongitude,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

@ObjectType('CoordinateType')
@InputType('CoordinateInput')
export class Coordinate {
	@IsLatitude({ message: 'Der Wert muss ein gültiger Längengrad sein.' })
	@Field(() => Float)
	lat: number;

	@IsLongitude({ message: 'Der Wert muss ein gültiger Breitengrad sein.' })
	@Field(() => Float)
	lon: number;
}

@ObjectType('BBoxType')
@InputType('BBoxInput')
export class BBox {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	topLeft: Coordinate;

	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	bottomRight: Coordinate;
}

@ObjectType('OrganizationGeoSettingsType')
@InputType('OrganizationGeoSettingsInput')
@ArgsType()
export class OrganizationGeoSettings {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	centroid: Coordinate;

	@ValidateNested()
	@Type(() => BBox)
	@Field()
	bbox: BBox;
}

@ObjectType()
export class OrganizationSettings {
	@ValidateNested()
	@Type(() => OrganizationGeoSettings)
	@Field()
	geo: OrganizationGeoSettings;
}

@ObjectType()
export class Organization extends BaseEntityModel {
	@IsString()
	@IsNotEmpty({ message: 'Der Organisationsname darf nicht leer sein.' })
	@Field()
	name: string;

	@ValidateNested()
	@Type(() => OrganizationSettings)
	@Field()
	settings: OrganizationSettings;
}
