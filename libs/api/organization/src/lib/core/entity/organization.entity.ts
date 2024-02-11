import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsNotEmpty,
	IsString,
	Validate,
	ValidateNested,
} from 'class-validator';

import { BBox, Coordinate, IsBBox } from '@kordis/api/geospatial';
import { BaseEntityModel } from '@kordis/api/shared';

@ObjectType()
@InputType('OrganizationGeoSettingsInput')
export class OrganizationGeoSettings {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	centroid: Coordinate;

	@ValidateNested()
	@Validate(IsBBox, {
		message:
			'Für das Begrenzungsrechteck müssen die Ecken oben links und unten rechts angegeben werden.',
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
