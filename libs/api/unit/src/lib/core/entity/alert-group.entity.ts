import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

import { BaseEntityModel } from '@kordis/api/shared';

import { UnitEntity } from './unit.entity';

@ObjectType('AlertGroup')
export class AlertGroupEntity extends BaseEntityModel {
	@Field()
	@AutoMap()
	name: string;

	@Field(() => [UnitEntity], {
		description:
			'The default units of the alert group. These units are assigned to the alert group by default and whenever deployments are reset.',
	})
	@AutoMap(() => [UnitEntity])
	defaultUnits: UnitEntity[];

	@Field(() => [UnitEntity], {
		description:
			'The current units of the alert group. These units will be presented to the user when the alert group is assigned to a deployment.',
	})
	@AutoMap(() => [UnitEntity])
	currentUnits: UnitEntity[];
}
