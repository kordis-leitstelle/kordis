import { AuthConfig } from 'angular-oauth2-oidc';

export const environment = {
	production: false,
	deploymentName: 'Dev Local',
	apiUrl: 'https://localhost:3333',
	oauth: {
		config: {
			redirectUri: window.origin + '/auth',
			oidc: true,
			responseType: 'code',
			clientId: '6b5aa2b3-6237-44ba-8448-252052e73831',
			issuer:
				'https://kordisleitstelle.b2clogin.com/5b974891-a530-4e68-ac04-e26a18c3bd46/v2.0/',
			tokenEndpoint:
				'https://kordisleitstelle.b2clogin.com/kordisleitstelle.onmicrosoft.com/b2c_1_signin/oauth2/v2.0/token',
			scope: 'openid offline_access 6b5aa2b3-6237-44ba-8448-252052e73831',
			strictDiscoveryDocumentValidation: false,
		} as AuthConfig,
		discoveryDocumentUrl:
			'https://kordisleitstelle.b2clogin.com/kordisleitstelle.onmicrosoft.com/B2C_1_SignIn/v2.0/.well-known/openid-configuration',
	},
};
