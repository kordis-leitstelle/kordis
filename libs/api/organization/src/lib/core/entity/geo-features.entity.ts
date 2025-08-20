import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsNotEmpty,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { BaseEntityModel, Coordinate } from '@kordis/api/shared';

@ObjectType()
export class GeoFeature extends BaseEntityModel {
	@AutoMap(() => Coordinate)
	@ValidateNested({ always: true })
	@Type(() => Coordinate)
	@Field(() => Coordinate)
	coordinate: Coordinate;

	@AutoMap()
	@ValidateIf((o) => !o.street && !o.name, { always: true })
	@IsNotEmpty({
		message: 'Eine Straße oder Name fehlt.',
		always: true,
	})
	@AutoMap()
	@IsString({ always: true })
	@Field()
	name: string;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	street: string;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	city: string;

	@AutoMap()
	@IsString({ always: true })
	@Field()
	postalCode: string;
}
