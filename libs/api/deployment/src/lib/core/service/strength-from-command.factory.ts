import { Injectable } from '@nestjs/common';

import { RescueStationStrength } from '../entity/rescue-station-deployment.entity';

@Injectable()
export class StrengthFromCommandFactory {
	create(strength: {
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
}
