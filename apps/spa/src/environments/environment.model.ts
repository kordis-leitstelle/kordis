import { AuthConfig } from 'angular-oauth2-oidc';

export type Environment = {
	production: boolean;
	apiUrl: string;
	deploymentName: string;
	oauth?: { discoveryDocumentUrl: string; config: AuthConfig };
};
