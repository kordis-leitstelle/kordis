# ADR010: Using NestJS Sagas for Cross-Domain Interactions (Reactive)

## Status

Accepted

## Context

As Kordis embraces loose coupling and an event-driven architecture, managing
interactions between bounded contexts is a critical topic. Traditional
approaches often involve direct integration between domains, leading to tight
coupling and reduced flexibility. The system requires a mechanism to react to
events from various domains and translate these events into appropriate actions
within a target domain without creating direct dependencies between them.

## Decision

We have decided to adopt NestJS Sagas to handle cross-domain interactions within
our system. NestJS Sagas will act as a mediator that listens to domain events
from various sources and translates them into domain-specific commands. This
approach leverages the strengths of NestJS's built-in support for event handling
and Sagas' ability to orchestrate complex sequences of operations across
different domains.

Implementation involves the following steps:

Listening to Events: Sagas will subscribe to events published by other domains
to the EventBus.<br> Data Enrichment and Transformation: Upon receiving an
event, the Saga may perform necessary queries to fetch additional data required
to process the event. It will also transform the event data into a format that
is understood by the target domain. You should use the
[rxjs operators](https://rxjs.dev/api/operators/) for this. <br> Command
Execution: The Saga then issues a command to the target domain, effectively
translating the event from the source domain into an actionable command in the
target domain.<br> By using Sagas in this manner, we create a layer that
abstracts the process of reacting to external events and invoking
domain-specific operations. This layer serves as the interface for interaction
with the domains.<br> <br> **The Saga implementation CAN live in the domain of
the target domain (the domain that receives the commands), since, as described,
we believe it acts as an interface. But, it should never be part of the domains
module and therefore never use specific providers. It should only communicate
via Commands and Queries, as the whole idea is, the Saga could live somewhere
else in the system, and it should not depend on the domain module.**

## Consequences

**Benefits:**<br> Decoupling: This approach significantly reduces the coupling
between domains, as they only need to emit events and listen to commands,
without knowing the internals of other domains.<br> Flexibility: It becomes
easier to add new sources of events or change the logic of how events are
processed, as these changes are encapsulated within the Sagas.<br>
Maintainability: By centralizing the logic for cross-domain interactions within
Sagas, the system becomes more maintainable. Each Saga can be independently
developed, tested, and modified, and in the future also independently
deployed.<br> <br> **Drawbacks:**<br> Complexity: Introducing Sagas adds a layer
of complexity to the system, requiring developers to understand the event-driven
model and the specifics of Saga implementation.<br> Debugging and Tracing:
Tracking the flow of events and commands through Sagas can be challenging,
especially in a system with many interacting domains. Effective logging and
tracing mechanisms are essential to mitigate this issue.<br> <br> Adopting
NestJS Sagas for cross-domain interactions presents a strategic approach to
building scalable, maintainable, and decoupled systems. The benefits in terms of
flexibility and maintainability outweigh the challenges associated with the
added complexity and debugging difficulties.
