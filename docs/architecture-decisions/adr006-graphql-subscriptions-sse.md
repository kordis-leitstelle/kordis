# ADR006: GraphQL Subscriptions over SSE

## Status

accepted

## Context

To distribute events to the client, we want to use GraphQL subscriptions, as we
already use GraphQL as our primary protocol. GraphQL subscriptions can be served
over WebSockets with different implementations (`graphql-ws`and the deprecated
but still widely used `subscriptions-transport-ws` package) or with Server-sent
events (SSE). The implementation impacts both, the API and the SPA, as the SPA
needs to link implement the same protocol layer to receive events.

## Decision

We implement GraphQL subscriptions over SSE. WebSockets are primarily used for
bidirectional messaging, whereas GraphQL subscriptions are unidirectional. Even
though the implementation with WebSocket seems more popular, SSE is the _better
fitting_ choice in terms of covering just what's needed. Furthermore, SSE works
over HTTP/1 or 2, meaning we can keep our interceptors and guards hooked into
the request pipeline. E.g. there will be no need to have 2 authentication entry
points. SSE is also more lightweight, since it is stateless compared to
WebSockets.

## Consequences

SSE have some limitations, where browsers might only allow up to 6 open
connections per domain. Currently, we weight this limitation as not significant,
but as complexity grows, we might need to switch to HTTP/2 to allow more than 6
connections.
