import { AuthConfig } from 'angular-oauth2-oidc';

export interface DynamicConfig {
	environmentName: string;
	apiUrl: string;
	sentryKey?: string;
	oauth?: {
		config: AuthConfig;
		discoveryDocumentUrl: string;
	};
}
