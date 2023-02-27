import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('APP_CONFIG');

export interface AppConfig {
	production: boolean;
	deploymentName: string;
	apiUrl: string;
}
