export interface CurrentWeatherCondition {
	uvIndexPhrase: string;
	hasPrecipitation: boolean;
	phrase: string;
	visibility: Visibility;
	cloudCover: number;
	observationTime: Date;
	pressure: Pressure;
	temperatureCelsius: number;
	iconFileName: string;
	wind: Wind;
}

export interface PartOfDayPrecipitation extends Precipitation {
	hours: number;
}

export type PartOfDayWind = Omit<Wind, 'gustSpeed'>;

export interface PartOfDayWeatherCondition {
	rain: PartOfDayPrecipitation;
	snow: PartOfDayPrecipitation;
	ice: PartOfDayPrecipitation;
	windGust: PartOfDayWind;
	thunderstormProbability: number;
	longPhrase: string;
	cloudCover: number;
	shortPhrase: string;
	iconFileName: string;
	wind: PartOfDayWind;
}

export interface DailyWeatherForecastEntry {
	date: Date;
	minTemperatureCelsius: number;
	maxTemperatureCelsius: number;
	night: PartOfDayWeatherCondition;
	day: PartOfDayWeatherCondition;
}

export interface DailyWeatherForecast {
	summaryPhrase: string;
	forecasts: DailyWeatherForecastEntry[];
}

export interface HourlyWeatherForecast {
	forecasts: HourlyWeatherForecastEntry[];
}

export interface HourlyWeatherForecastEntry {
	date: Date;
	uvIndexPhrase: string;
	rain: Precipitation;
	visibility: ValueUnit;
	snow: Precipitation;
	ice: Precipitation;
	temperatureCelsius: number;
	iconFileName: string;
	wind: Wind;
}

export interface PressureTendency {
	phrase: string;
	iconFileName: string;
}

export interface Pressure {
	unit: string;
	tendency: PressureTendency;
	value: number;
}

export interface ValueUnit {
	unit: string;
	value: number;
}

export interface Beaufort {
	grade: number;
	description: string;
}

export interface WindSpeed {
	beaufort: Beaufort;
	unit: string;
	value: number;
}

export interface Wind {
	degreesDescription: string;
	degrees: number;
	speed: WindSpeed;
	gustSpeed: WindSpeed;
}

export interface Visibility {
	unit: string;
	obstruction: string;
	value: number;
}

export interface Precipitation {
	amount: ValueUnit;
	probability: number;
}
