# SPA Auth

This Library contains all Services, Guards and Components regarding AuthN. The Library requiers the `OAuthModule` from _angular-oauth2-oidc_ to be present.

# Usage

The `AuthService` contains an init function that takes the auth configuration and a discovery document url for the OAuth metadata document. This should be called from the application bootstrap components constructor.
When the document has been loaded, the `isDoneLoading$` will emit `true` and the consumer can safely listen to `isAuthenticated$`.

## Running unit tests

Run `nx test spa-auth` to execute the unit tests.
