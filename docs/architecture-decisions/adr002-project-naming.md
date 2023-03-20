# ADR002: Project Naming

## Status

accepted

## Context

Currently, we are developing two projects in this repository an Angular-based, user-facing single-page application and the NestJS-based backend application providing the API layer for the single-page application.
Across our tools like Nx, Angular CLI, NestJS CLI and Azure, these projects have different names like API, SPA, or Web App.

## Decision

To provide a consistent naming, we will refer to our Angular-based, user-facing single-page application as _SPA_ (Single Page Application) and to our NestJS-based backend application as _API_ (Application Programming Interface).

## Consequences

Across all tools and systems, we will use the names _SPA_ and _API_, or some derivative, to refer to the respective projects.
