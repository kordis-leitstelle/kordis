# ADR007: GraphQL

## Status

accepted

## Context

We need to select an API paradigm/technology as our primary communication
protocol. The 2 main options we identified are considering are RESTful and
GraphQL.

## Decision

We have decided to use GraphQL for this project instead of REST. The following
are the reasons why:

**Real-time capabilities**  
GraphQL allows for real-time capabilities. With GraphQL subscriptions, we can
subscribe to changes and get updates as soon as they happen, all with
one-request.

**Self-documenting**  
GraphQL is self-documenting. With REST, we need to maintain separate
documentation to keep track of the endpoints, query parameters, and response
structures. With GraphQL, the schema serves as documentation, making it easier
to understand and use the API.

**Flexible UI views**  
GraphQL allows different UI views to choose different view models. This means
that different clients and different parts of the application can request the
data they require, without the need for multiple endpoints. In REST, each
endpoint has a specific structure, and it can be challenging to provide
different views without creating additional endpoints. With GraphQL, we can move
the presentation logic completely into the frontend without the need to
implement some kind of specific presenters in the backend.

## Consequences

**Learning curve**  
GraphQL has a steeper learning curve compared to REST, mainly due to its
declarative nature and the need to understand the schema specifications. This
might make onboarding hard, but with proper documentation and abstraction
through the [Code-First approach](./adr004-graphql-schema.md), we categorize
this as a minor downside.

**Lock-in**  
Another possible pitfall could be the lock-in into Apollo GraphQL, since every
implementation has different specifications due to a lack of standardization in
the GraphQL sphere. Since Apollo is the most popular GraphQL open-source
implementation, we consider this a minor downside as well.
