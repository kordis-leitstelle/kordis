import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface WeatherOptions {
	azureMapKey?: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<WeatherOptions>()
		.setClassMethodName('forRoot')
		.build();
