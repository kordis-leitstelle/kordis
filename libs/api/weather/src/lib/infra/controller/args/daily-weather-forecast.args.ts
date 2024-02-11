import { ArgsType, Field, Float, Int } from '@nestjs/graphql';
import { IsLatitude, IsLongitude, Validate } from 'class-validator';

import { IsOneOf } from '@kordis/api/shared';

@ArgsType()
export class DailyWeatherForecastArgs {
	@Field(() => Float)
	@IsLatitude()
	latitude: number;

	@Field(() => Float)
	@IsLongitude()
	longitude: number;

	@Field(() => Int, { defaultValue: 1 })
	@Validate(IsOneOf, [1, 5, 10], {
		message: 'Die Voraussage kann nur für 1, 5 oder 10 Tage abgerufen werden.',
	})
	days: 1 | 5 | 10;
}
