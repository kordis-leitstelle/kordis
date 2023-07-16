### Development Tokens

This file contains some development tokens that can be used to directly call the
API with pre-defined claims. The test users are equivalent to the users used in
[E2Es](../spa-e2e/README.md) and the test users registered in the development
application of our AAD.

| **Username** | **ID** (`oid`)                       | **First name** (`first_name`) | **Last name** (`last_name`) | **Emails** (`emails`)         | **Organization** (`organization`)           | Token                                                                                                                                                         |
| ------------ | ------------------------------------ | ----------------------------- | --------------------------- | ----------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| testuser     | c0cc4404-7907-4480-86d3-ba4bfc513c6d | Test                          | User                        | testuser@kordis-leitstelle.de | testorganization (dff7584efe2c174eee8bae45) | `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJvaWQiOiIxMjM0IiwiZW1haWxzIjpbInRlc3R1c2VyQHRlc3QuY29tIl0sImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIDEifQ.` |

The claims will be mapped to the
[AuthUser](../../libs/shared/auth/src/lib/auth-user.model.ts) Model in the
[AuthInterceptor](../../libs/api/auth/src/lib/interceptors/auth.interceptor.ts).
