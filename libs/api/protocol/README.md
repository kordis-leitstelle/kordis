# api-protocol

This library is responsible for providing the API and business logic for the
protocol feature. The protocol is a collection of entries documenting the
overall events and communication both manually added by the users as well as
automatically added by transactions like starting an operation or logging in a
station.

Currently the protocol documents events with the following entry types:

- [`CommunicationMessage`](./src/lib/core/entity/protocol-entries/communication-message.entity.ts):
  Documenting the communication between any two units

## Running unit tests

Run `nx test api-protocol` to execute the unit tests via
[Jest](https://jestjs.io).
