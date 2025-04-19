import { AutoMap } from '@automapper/classes';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsBoolean,
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
@InputType('MapStylesInput')
export class MapStyles {
	@Field()
	@IsString()
	@AutoMap()
	streetUrl: string;

	@Field()
	@IsString()
	@AutoMap()
	satelliteUrl: string;

	@Field()
	@IsString()
	@AutoMap()
	darkUrl: string;
}

@ObjectType()
@InputType('MapLayerInput')
export class MapLayer {
	@Field()
	@IsString()
	@AutoMap()
	name: string;

	@Field()
	@IsString()
	@AutoMap()
	wmsUrl: string;

	@Field()
	@IsBoolean()
	@AutoMap()
	defaultActive: boolean;
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

	@ValidateNested()
	@Field()
	@AutoMap()
	mapStyles: MapStyles;

	@Field(() => [MapLayer])
	@AutoMap(() => [MapLayer])
	@ValidateNested({ each: true })
	@Type(() => MapLayer)
	mapLayers: MapLayer[];
}

@ObjectType()
export class OrganizationEntity extends BaseEntityModel {
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
