# Alerting

This module handles the alerting of alarm groups via multiple providers.
Currently the following provider strategies are implemented:

- [Divera 24/7](https://www.divera247.com)

Each alert group has a config for the provider (e.g. a mapping for the alert
group for the provider). The providers have a config aswell. An organization can
currently have one provider, thus leading to all alert groups needing a config
for this provider.

## Running unit tests

Run `nx test alerting` to execute the unit tests via [Jest](https://jestjs.io).
