import { AuthConfig } from 'angular-oauth2-oidc';

export const environment = {
	production: false,
	environmentName: 'Dev Local',
	releaseVersion: '0.0.0-development',
} as {
	production: boolean;
	environmentName: string;
	releaseVersion: string;
	// following properties are from the runtime dependent assets/config.json
	apiUrl: string;
	sentryKey?: string;
	oauth?: {
		config: AuthConfig;
		discoveryDocumentUrl: string;
	};
};
