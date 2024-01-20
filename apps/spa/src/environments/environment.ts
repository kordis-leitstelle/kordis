import { AuthConfig } from 'angular-oauth2-oidc';

export const environment = {
	production: false,

	releaseVersion: '0.0.0-development',
} as {
	production: boolean;
	releaseVersion: string;
	// following properties are from the runtime dependent assets/config.json
	environmentName: string;
	apiUrl: string;
	sentryKey?: string;
	oauth?: {
		config: AuthConfig;
		discoveryDocumentUrl: string;
	};
};
