import { ArgsType, Field, Float, Int } from '@nestjs/graphql';
import { IsLatitude, IsLongitude, Validate } from 'class-validator';

import { IsOneOf } from '@kordis/api/shared';

@ArgsType()
export class HourlyWeatherForecastArgs {
	@Field(() => Float)
	@IsLatitude()
	latitude: number;

	@Field(() => Float)
	@IsLongitude()
	longitude: number;

	@Field(() => Int, { defaultValue: 1 })
	@Validate(IsOneOf, [1, 12, 24, 72], {
		message:
			'Die Voraussage kann nur für 1, 12, 24, 72 Stunden abgerufen werden.',
	})
	hours: 1 | 12 | 24 | 72;
}
