# AI Project Structure Instructions

## Repository Layout
- The repository root contains application folders under `apps/`.
- Each application folder must contain exactly two top-level directories:
  - `backend/`
  - `frontend/`

## Rules For App Folders
- Do not add other top-level folders inside an app folder.
- Shared utilities should live outside app folders unless they are specific to one side.
- Place backend-only code in `backend/`.
- Place frontend-only code in `frontend/`.

## Docs Layout
- `docs/frontend/` is for frontend app for documentation, i.e. docusaurus.
- `docs/backend/` is for backend api for documentation, i.e. database for documentation.
