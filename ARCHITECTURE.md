# Architecture: Smart Stadiums Solution

## High-Level Design
This project is built as a **single-service architecture** rather than a multi-package monorepo. This approach was chosen to maintain a smaller, more auditable surface area, ensuring explicit boundaries and easier testing.

## Layers

### 1. Data Layer (`data/`, `src/data/`)
- Contains static datasets (`venues.json`) representing the ground truth.
- Provides pure lookup functions (`src/data/venues.ts`) utilizing a load-once-cache pattern.
- Ensures data immutability by shallow-copying returned objects so callers cannot corrupt the shared cache.

### 2. Tools Layer (`src/tools/`)
- Pure, typed functions that execute specific domain logic (e.g., fetching venue info, finding services, providing live status).
- Never throws exceptions. Unknown inputs or internal errors return a typed `{ error: string }` payload.
- Serves as the single source of truth for both live AI paths and offline fallbacks.

### 3. Assistant / AI Layer (Future Phase)
- Will contain the prompt structures and LLM integration.

### 4. API Layer (Future Phase)
- Will provide Express routes connecting frontends to the tools and assistant engines.
