import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsLatitude,
	IsLongitude,
	IsNotEmpty,
	IsString,
	Validate,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';

import { IsBBox } from './bbox.validator';

@ObjectType()
@InputType('CoordinateInput')
export class Coordinate {
	@IsLatitude({ message: 'Der Wert muss ein gültiger Längengrad sein.' })
	@Field(() => Float)
	lat: number;

	@IsLongitude({ message: 'Der Wert muss ein gültiger Breitengrad sein.' })
	@Field(() => Float)
	lon: number;
}

@ObjectType()
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

@ObjectType()
@InputType('OrganizationGeoSettingsInput')
export class OrganizationGeoSettings {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	centroid: Coordinate;

	@ValidateNested()
	@Validate(IsBBox, {
		message: 'Wrong post title',
	})
	@Type(() => BBox)
	@Field()
	bbox: BBox;
}

@ObjectType()
export class Organization extends BaseEntityModel {
	@IsString()
	@IsNotEmpty({ message: 'Der Organisationsname darf nicht leer sein.' })
	@Field()
	name: string;

	@ValidateNested()
	@Type(() => OrganizationGeoSettings)
	@Field()
	geoSettings: OrganizationGeoSettings;
}
