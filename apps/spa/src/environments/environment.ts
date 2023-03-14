import { AuthConfig } from 'angular-oauth2-oidc';

export const environment = {
	production: false,
	deploymentName: 'Dev Local',
	apiUrl: 'https://localhost:3333',
	oauth: {
		config: {
			redirectUri: 'http://localhost:4200/auth',
			oidc: true,
			responseType: 'code',
			clientId: 'd3c8c4e6-ef97-4878-935e-167ef9b68f41',
			issuer:
				'https://kordisleitstelle.b2clogin.com/5b974891-a530-4e68-ac04-e26a18c3bd46/v2.0/',
			tokenEndpoint:
				'https://kordisleitstelle.b2clogin.com/kordisleitstelle.onmicrosoft.com/b2c_1_signin/oauth2/v2.0/token',
			scope: 'openid offline_access d3c8c4e6-ef97-4878-935e-167ef9b68f41',
			strictDiscoveryDocumentValidation: false,
		} as AuthConfig,
		discoveryDocumentUrl:
			'https://kordisleitstelle.b2clogin.com/kordisleitstelle.onmicrosoft.com/B2C_1_SignIn/v2.0/.well-known/openid-configuration',
	},
};
