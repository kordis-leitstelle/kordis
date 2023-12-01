import type { AuthConfig } from 'angular-oauth2-oidc';

export type Environment = {
	production: boolean;
	apiUrl: string;
	environmentName: string;
	releaseVersion: string;
	oauth?: { discoveryDocumentUrl: string; config: AuthConfig };
	sentryKey?: string;
};
