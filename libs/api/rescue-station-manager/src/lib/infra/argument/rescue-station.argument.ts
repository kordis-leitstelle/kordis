import { Field, InputType } from '@nestjs/graphql';
import {
	ArrayNotEmpty,
	IsInt,
	IsMongoId,
	IsNotEmpty,
	IsString,
	Min,
} from 'class-validator';

@InputType('UpdateRescueStationStrength')
export class RescueStationStrengthArg {
	@Field()
	@IsInt()
	@Min(0, { message: 'Die Anzahl der Führungskräfte muss mindestens 0 sein.' })
	leaders: number;

	@Field()
	@IsInt()
	@Min(0, {
		message: 'Die Anzahl der Unterführungskräfte muss mindestens 0 sein.',
	})
	subLeaders: number;

	@Field()
	@IsInt()
	@Min(0, { message: 'Die Anzahl der Helfer muss mindestens 0 sein.' })
	helpers: number;
}

@InputType('UpdateRescueStationAssignedAlertGroup')
export class RescueStationAssignedAlertGroupArg {
	@Field()
	@IsString()
	@IsNotEmpty()
	alertGroupId: string;

	@Field(() => [String])
	@IsMongoId({ each: true })
	@IsNotEmpty({ each: true })
	@ArrayNotEmpty({
		message:
			'Es muss mindestens eine Einheit der Alarmgruppe zugewiesen werden',
	})
	unitIds: string[];
}
