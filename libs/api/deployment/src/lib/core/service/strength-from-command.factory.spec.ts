import { RescueStationStrength } from '../entity/rescue-station-deployment.entity';
import { createStrengthFromCommand } from './strength-from-command.factory';

describe('StrengthFromCommandFactory', () => {
	it('should create a RescueStationStrength from command', () => {
		const command = {
			leaders: 1,
			subLeaders: 2,
			helpers: 3,
		};

		const strength = createStrengthFromCommand(command);

		expect(strength).toBeInstanceOf(RescueStationStrength);
		expect(strength.leaders).toEqual(command.leaders);
		expect(strength.subLeaders).toEqual(command.subLeaders);
		expect(strength.helpers).toEqual(command.helpers);
	});
});
