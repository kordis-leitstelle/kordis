import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RescueStationMessageStrength {
	@Field()
	@AutoMap()
	leaders: number;

	@Field()
	@AutoMap()
	subLeaders: number;

	@Field()
	@AutoMap()
	helpers: number;
}

@ObjectType()
export class RescueStationMessageAssignedUnit {
	@Field()
	@AutoMap()
	id: string;

	@Field()
	@AutoMap()
	name: string;

	@Field()
	@AutoMap()
	callSign: string;
}

@ObjectType()
export class RescueStationMessageAssignedAlertGroup {
	@Field()
	@AutoMap()
	id: string;

	@Field()
	@AutoMap()
	name: string;

	@Field(() => [RescueStationMessageAssignedUnit])
	@AutoMap(() => [RescueStationMessageAssignedUnit])
	units: RescueStationMessageAssignedUnit[];
}

@ObjectType()
export class RescueStationMessagePayload {
	@Field()
	@AutoMap()
	rescueStationId: string;

	@Field()
	@AutoMap()
	rescueStationName: string;

	@Field()
	@AutoMap()
	rescueStationCallSign: string;

	@Field()
	@AutoMap()
	strength: RescueStationMessageStrength;

	@Field(() => [RescueStationMessageAssignedUnit])
	@AutoMap(() => [RescueStationMessageAssignedUnit])
	units: RescueStationMessageAssignedUnit[];

	@Field(() => [RescueStationMessageAssignedAlertGroup])
	@AutoMap(() => [RescueStationMessageAssignedAlertGroup])
	alertGroups: RescueStationMessageAssignedAlertGroup[];
}
