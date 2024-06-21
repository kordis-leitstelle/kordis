import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import {
	RescueStationAssignedAlertGroupArg,
	RescueStationStrengthArg,
} from './rescue-station.argument';

@InputType()
export class UpdateRescueStationInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	rescueStationId: string;

	@Field(() => RescueStationStrengthArg)
	@ValidateNested()
	@Type(() => RescueStationStrengthArg)
	strength: RescueStationStrengthArg;

	@Field({ defaultValue: '' })
	@IsString()
	note: string;

	@Field(() => [String], {
		description:
			'The Units to assign. If a Unit is currently assigned to another Rescue Station it will be released first. Units currently assigned to an operation will result in an error!',
	})
	@IsString({ each: true })
	assignedUnitIds: string[];

	@Field(() => [RescueStationAssignedAlertGroupArg], {
		description:
			'The Alert Groups to assign. If a Unit is currently assigned to another Rescue Station it will be released first. If the alert group is assigned to another deployment, it will be released and units that are not assigned within the new assignment will be kept as normally assigned units in the deployment. Alert Groups and Units currently assigned to an operation will result in an error!',
	})
	@ValidateNested({ each: true })
	@Type(() => RescueStationAssignedAlertGroupArg)
	assignedAlertGroups: RescueStationAssignedAlertGroupArg[];
}
