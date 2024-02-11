import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface WarningOptions {
	mongoUri: string;
	checkForNewWarningsIntervalSec?: number;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<WarningOptions>()
		.setClassMethodName('forRoot')
		.build();
