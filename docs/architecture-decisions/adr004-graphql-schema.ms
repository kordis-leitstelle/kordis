# ADR004: GraphQL Schema Generation Strategy

## Status

accepted

## Context

Apollo GraphQL offers 2 approaches to create and maintain a GraphQL schema: Code First and Schema First. We have to choose one of them to start developing our Graph.

## Decision

We are using the Code First approach which generates a GraphQL schema from TypeScript classes and their annotations.
With the Code First approach, we have type safety out of the box and we can generate the schema automatically.
Furthermore, the knowledge about GraphQL schema specifications is rare in the team, which also contributed to this decision.

## Consequences

- It is easier to setup, maintain and refactor.
- We can think in TypeScript models and types while developing our schema, which should enable us to develop faster.
- We might hit a barrier which we currently can not see with the Code First Approach when our schema gets complex.
