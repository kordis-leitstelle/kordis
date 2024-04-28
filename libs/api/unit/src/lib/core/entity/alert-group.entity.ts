import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

import { BaseEntityModel } from '@kordis/api/shared';

import { UnitEntity } from './unit.entity';

@ObjectType('AlertGroup')
export class AlertGroupEntity extends BaseEntityModel {
	@Field()
	@AutoMap()
	name: string;

	@Field(() => [UnitEntity])
	@AutoMap(() => [UnitEntity])
	units: UnitEntity[];
}
