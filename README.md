# Toolerp

Enterprise systems ontology and architecture research workspace.

This repository is organized as a graph-first research corpus, not a simple org chart.

Start here:

- [Research index](research/README.md)
- [Unified semantic model](research/13-model/unified-semantic-relationship-model.md)
- [Enterprise master map](research/15-master-map/enterprise-master-map.md)
- [Source index](research/sources/source-index.md)

## mk1 dev run

Run the frontend and backend together with one command from the repository root:

```powershell
scripts\dev.cmd
```

The canonical mk1 development settings live in `mk1/.env.development`.

This starts:

- the Vite frontend on the `VITE_FRONTEND_PORT` value from `mk1/.env.development`
- the .NET backend API on the `VITE_BACKEND_PORT` value from `mk1/.env.development`

Prerequisites:

- `npm` available on `PATH`
- `.NET SDK 10` available on `PATH`
- frontend dependencies already installed in `mk1/frontend`
- the configured frontend and backend ports free before startup

Stop both services with `Ctrl+C` in the launcher terminal.
