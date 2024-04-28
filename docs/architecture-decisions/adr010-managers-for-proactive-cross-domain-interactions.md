# ADR010: Using Managers for Cross-Domain Interactions (Proactive)

## Status

Accepted

## Context

As Kordis embraces loose coupling and an event-driven architecture, managing
interactions between bounded contexts is a critical topic. Traditional
approaches often involve direct integration between domains, leading to tight
coupling and reduced flexibility. The system requires a mechanism to communicate
with multiple systems in order to manage cross domain related tasks. This is
analogous to the reactive part described in
[ADR009](./adr009-sagas-for-reactive-cross-domain-interactions.md), but the
difference is, that the system is not reacting to events, but proactively
communicating with other systems.

## Decision

We have decided to adopt the concept of Managers to handle cross-domain
interactions within our system. Managers will act as a mediator that
communicates with other systems and translates them into domain-specific
commands. By introducing a dedicated instance that communicates with each
domain, we decouple the domains from each other and create a layer that
abstracts the process of interacting with other domains. This layer serves as
the interface for interaction with the domains.

Implementation involves the following steps: <br> Process managers will be
implemented as a distinct library and NestJS module. The manager will follow the
Clean Architecture approach, just as it is implemented in every Domain Module.
The Manager is allowed to implement actual Controllers (e.g. GraphQL resolvers)
in order to react to incoming request from the frontend/other systems. The
manager is allowed to throw "Domain"-specific events and implement reactive
components to these events, such as GraphQL Subscription Handlers. The
interaction with Domains should be done via Commands and Queries, as the whole
idea is, the Manager could live somewhere else in the system, and it should not
depend on the domain module. The Manager must not use specific providers from
the domain module. This makes sure that we can outsource the Manager and Domains
and let them interact through a Bus.

## Consequences

**Benefits:**

Decoupling: This approach significantly reduces the coupling between domains, as
they only need to emit events and listen to commands, without knowing the
internals of other domains.

**Drawbacks:**

Complexity: Introducing Managers adds a layer of complexity to the system,
requiring developers to understand the specifics of Manager implementation.

Debugging and Tracing: Tracking the flow of events and commands through Managers
can be challenging, especially in a system with many interacting domains.
Effective logging and tracing mechanisms are essential to mitigate this issue.
