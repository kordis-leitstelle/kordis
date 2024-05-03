import { AutoMap } from '@automapper/classes';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsNotEmpty,
	IsString,
	Validate,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel, Coordinate } from '@kordis/api/shared';

import { IsBBox } from './bbox.validator';

@ObjectType()
@InputType('BBoxInput')
export class BBox {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	@AutoMap()
	topLeft: Coordinate;

	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	@AutoMap()
	bottomRight: Coordinate;
}

@ObjectType()
@InputType('OrganizationGeoSettingsInput')
export class OrganizationGeoSettings {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	@AutoMap()
	centroid: Coordinate;

	@ValidateNested()
	@Validate(IsBBox, {
		message:
			'Für das Begrenzungsrechteck müssen die Ecken oben links und unten rechts angegeben werden.',
	})
	@Type(() => BBox)
	@Field()
	@AutoMap()
	bbox: BBox;
}

@ObjectType()
export class Organization extends BaseEntityModel {
	@IsString()
	@IsNotEmpty({ message: 'Der Organisationsname darf nicht leer sein.' })
	@Field()
	@AutoMap()
	name: string;

	@ValidateNested()
	@Type(() => OrganizationGeoSettings)
	@Field()
	@AutoMap()
	geoSettings: OrganizationGeoSettings;
}
