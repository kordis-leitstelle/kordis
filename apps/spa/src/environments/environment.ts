import { DynamicConfig } from './dynamic-config.model';

export const environment = {
	production: false,
	releaseVersion: '0.0.0-development',
} as {
	production: boolean;
	releaseVersion: string;
} & DynamicConfig; // DynamicConfig properties are from the runtime dependent assets/config.json
