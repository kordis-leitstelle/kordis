# ADR003: E2E Test Strategy

## Status

accepted

## Context

There is the need to run E2Es automatically in the pipeline to test our whole
application. We had no strategy on what and where to do any end-to-end testing.

## Decision

- We are only end-to-end testing our SPA application because:
- 1. it reduces the complexity of the whole project,
- 2. there is no value in having API E2Es while the SPA E2E cover all
     functionality,
- 3. we ship only one bundle and therefore do not need regression tests for
     multiple API versions.
- For PRs, we run against a "locally" (in the pipeline) started instance of the
  SPA and the API Project.
- For pushes into main, we test against the next deployment on our Azure
  Infrastructure.

## Consequences

We do not have an explicit end-to-end coverage of the API in exchange for faster
development and less test maintenance. The complete pipeline with interceptors
etc. of the API will not be tested explicitly. With enough unit tests and the
end-to-end tests from the SPA project which consumes the API, there should be
enough coverage for both projects.
