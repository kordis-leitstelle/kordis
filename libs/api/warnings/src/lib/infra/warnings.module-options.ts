import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';

export interface WarningOptions {
	checkCronExpression?: string | CronExpression;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<WarningOptions>()
		.setClassMethodName('forRoot')
		.build();
