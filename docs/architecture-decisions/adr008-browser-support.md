# ADR008: Browser Support

## Status

Accepted

## Context

Our legacy application has been experiencing issues with Firefox and other
non-Chromium browsers. These issues have been causing delays in development and
have been a source of bugs that are hard to track and fix. Moreover, we want to
leverage the latest web features such as CSS nesting, which are best supported
and regularly updated in Chromium browsers. Supporting only the latest 2
versions of Chromium browsers (Chrome and Edge) will allow us to focus our
efforts on a more narrow range of browsers, reducing the complexity of our
development and testing processes.

## Decision

We will only officially support the latest 2 versions of Chromium browsers
(Chrome and Edge). This means that while the application may still work in other
browsers, we will not be spending resources on testing and fixing issues that
are specific to those browsers.

## Consequences

- Development will be easier as we only need to consider the latest 2 versions
  of Chromium browsers.
- We can leverage the latest web features that are best supported in Chromium
  browsers.
- We will need to test the application in the latest 2 versions of Chromium
  browsers.
  [This is not possible with Playwright, which always tests against the latest stable version](https://github.com/microsoft/playwright/issues/14435).
  Therefore, a small possibility of bugs in older versions remains.
- Users using other browsers may experience issues.
- We will need to clearly communicate this decision to our users and update our
  documentation accordingly.
