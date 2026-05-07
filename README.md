# Toolerp

Toolerp is being documented as a centralized operational platform for coordinating people, tools, inventory, tasks, projects, permissions, workflows, telemetry, events, and machine orchestration.

This repository is currently in a documentation-first architecture phase. The immediate goal is to establish the software plan, module boundaries, and development conventions before expanding the implementation.

## Planned Repository Shape

The target repository structure follows these rules:

- Application folders live under `apps/`.
- Each app contains exactly `backend/` and `frontend/`.
- Shared reusable modules live outside app folders unless they are tightly coupled to one side.
- Documentation is split between `docs/backend/` and `docs/frontend/`.

Planned layout:

```text
apps/
	operations/
		backend/
		frontend/
packages/
	shared/
docs/
	backend/
	frontend/
```

## Documentation

- Backend and platform architecture plan: `docs/backend/`
- Frontend documentation site: `docs/frontend/`

## Current Scope

The current documentation defines the initial foundation for:

- generalized operational entities
- event-driven backend architecture
- task orchestration groundwork
- extensible authorization
- versioned APIs with validation and typed contracts
- scalable frontend shell for dashboards and real-time updates

Implementation code can follow this plan incrementally without committing to premature microservices or over-specialized modules.
