export interface ValueUnit {
	value: number;
	unit: string;
	unitType: number;
}

export interface CurrentConditionAPIResponse {
	results: {
		dateTime: string;
		phrase: string;
		iconCode: number;
		hasPrecipitation: boolean;
		isDayTime: boolean;
		temperature: ValueUnit;
		realFeelTemperature: ValueUnit;
		realFeelTemperatureShade: ValueUnit;
		relativeHumidity: number;
		dewPoint: ValueUnit;
		wind: {
			direction: {
				degrees: number;
				localizedDescription: string;
			};
			speed: ValueUnit;
		};
		windGust: {
			speed: ValueUnit;
		};
		uvIndex: number;
		uvIndexPhrase: string;
		visibility: ValueUnit;
		obstructionsToVisibility: string;
		cloudCover: number;
		ceiling: ValueUnit;
		pressure: ValueUnit;
		pressureTendency: {
			localizedDescription: string;
			code: string;
		};
		past24HourTemperatureDeparture: ValueUnit;
		apparentTemperature: ValueUnit;
		windChillTemperature: ValueUnit;
		wetBulbTemperature: ValueUnit;
		precipitationSummary: {
			pastHour: ValueUnit;
			past3Hours: ValueUnit;
			past6Hours: ValueUnit;
			past9Hours: ValueUnit;
			past12Hours: ValueUnit;
			past18Hours: ValueUnit;
			past24Hours: ValueUnit;
		};
		temperatureSummary: {
			past6Hours: {
				minimum: ValueUnit;
				maximum: ValueUnit;
			};
			past12Hours: {
				minimum: ValueUnit;
				maximum: ValueUnit;
			};
			past24Hours: {
				minimum: ValueUnit;
				maximum: ValueUnit;
			};
		};
	}[];
}

export interface PartOfDayCondition {
	iconCode: number;
	iconPhrase: string;
	hasPrecipitation: boolean;
	precipitationType: string;
	precipitationIntensity: string;
	shortPhrase: string;
	longPhrase: string;
	precipitationProbability: number;
	thunderstormProbability: number;
	rainProbability: number;
	snowProbability: number;
	iceProbability: number;
	wind: {
		direction: {
			degrees: number;
			localizedDescription: string;
		};
		speed: ValueUnit;
	};
	windGust: {
		direction: {
			degrees: number;
			localizedDescription: string;
		};
		speed: ValueUnit;
	};
	totalLiquid: ValueUnit;
	rain: ValueUnit;
	snow: ValueUnit;
	ice: ValueUnit;
	hoursOfPrecipitation: number;
	hoursOfRain: number;
	hoursOfSnow: number;
	hoursOfIce: number;
	cloudCover: number;
}

export interface DailyForecastAPIResponse {
	summary: {
		startDate: string;
		endDate: string;
		severity: number;
		phrase: string;
		category: string;
	};
	forecasts: {
		date: string;
		temperature: {
			minimum: ValueUnit;
			maximum: ValueUnit;
		};
		realFeelTemperature: {
			minimum: ValueUnit;
			maximum: ValueUnit;
		};
		realFeelTemperatureShade: {
			minimum: ValueUnit;
			maximum: ValueUnit;
		};
		hoursOfSun: number;
		degreeDaySummary: {
			heating: ValueUnit;
			cooling: ValueUnit;
		};
		airAndPollen: Array<{
			name: string;
			value: number;
			category: string;
			categoryValue: number;
			type?: string;
		}>;
		day: PartOfDayCondition;
		night: PartOfDayCondition;
	}[];
}

export interface HourlyForecastAPIResponse {
	forecasts: {
		date: string;
		iconCode: number;
		iconPhrase: string;
		hasPrecipitation: boolean;
		isDaylight: boolean;
		temperature: ValueUnit;
		realFeelTemperature: ValueUnit;
		wetBulbTemperature: ValueUnit;
		dewPoint: ValueUnit;
		wind: {
			direction: {
				degrees: number;
				localizedDescription: string;
			};
			speed: ValueUnit;
		};
		windGust: {
			speed: ValueUnit;
		};
		relativeHumidity: number;
		visibility: ValueUnit;
		cloudCover: number;
		ceiling: ValueUnit;
		uvIndex: number;
		uvIndexPhrase: string;
		precipitationProbability: number;
		rainProbability: number;
		snowProbability: number;
		iceProbability: number;
		totalLiquid: ValueUnit;
		rain: ValueUnit;
		snow: ValueUnit;
		ice: ValueUnit;
		precipitationType?: string;
		precipitationIntensity?: string;
	}[];
}
