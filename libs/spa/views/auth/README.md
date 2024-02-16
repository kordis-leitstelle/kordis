# SPA Auth

This Library contains all Services, Guards, Components and dependencies
regarding AuthN.

The `AuthModule` has to be initialized in the bootstrap module with the given
configurations in the `forRoot` method. The OAuthService will be initialized
with the given configurations through the `APP_INITIALIZER` provider. You can
safely consume the `isAuthenticated$`and `user$` observables through the
`AuthService` at any lifecycle level. The `login` method will start the Code
Flow and redirect to the given OAuth Provider. As a session store we choose
_localStorage_ over the _sessionStorage_ due to its persistence and easier
testing via Playwrights `sessionStorage`. This is only active in production
environments.

For **local dev environments** we use the `DevAuthModule`. Instead of getting
redirected to the OAuth Provider, the user will be redirected to the development
login, which lets developer login as a test user with a predefined set or a
custom set of claims.

## Running unit tests

Run `nx test spa-auth` to execute the unit tests.
