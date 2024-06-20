import { RescueStationStrength } from '../entity/rescue-station-deployment.entity';

export function createStrengthFromCommand(strength: {
	leaders: number;
	subLeaders: number;
	helpers: number;
}): RescueStationStrength {
	const strengthValueObject = new RescueStationStrength();
	strengthValueObject.leaders = strength.leaders;
	strengthValueObject.subLeaders = strength.subLeaders;
	strengthValueObject.helpers = strength.helpers;
	return strengthValueObject;
}
