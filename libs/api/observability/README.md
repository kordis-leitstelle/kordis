# API Observability

This module handles Observability/Telemetry for the API. For transmitting
telemetry data, OpenTelemetry is used, as it is the industry standard can easily
be integrated with other tools such as Prometheus etc. Currently, we rely on
Sentry, which also offers exceptions tracking. Using other providers is
possible, but not implemented. The OTel SDK has to be created once in the
bootstrap file (`main.ts`) via import.

Automatically traced are:

- GraphQL resolutions (through the OpenTelemetry GraphQL Instrumentation)
- Resolvers
- Interceptors
- Methods that are decorated with `@Trace('optional trace name')`

OTel and the Module will only be initialized if the node environment is set to
`production`.

## Running unit tests

Run `nx test api-observability` to execute the unit tests via
[Jest](https://jestjs.io).
