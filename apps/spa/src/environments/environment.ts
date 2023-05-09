import { AuthConfig } from 'angular-oauth2-oidc';

export const environment: {
	production: boolean;
	apiUrl: string;
	deploymentName: string;
	oauth?: { discoveryDocumentUrl: string; config: AuthConfig };
} = {
	production: false,
	deploymentName: 'Dev Local',
	apiUrl: 'https://localhost:3000',
};
