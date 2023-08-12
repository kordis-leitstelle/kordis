import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface ShipPositionsOptions {
	hpa?: {
		amqpUri: string;
		mongoCacheUri: string;
		cert: string;
		key: string;
		ca: string;
	};
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<ShipPositionsOptions>()
		.setClassMethodName('forRoot')
		.build();
