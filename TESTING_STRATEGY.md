# Testing Strategy

Our testing strategy follows a rigorous pyramid approach focusing heavily on determinism and total coverage of the data and logic layers. By isolating the offline tools and logic from external dependencies, we achieve maximum confidence in the fallback behavior.

## Core Layers
1. **Pure Tool Tests (`src/tools/`, `src/data/`)**
   - **Target:** 100% branch, statement, function, and line coverage.
   - **Determinism:** Tests explicitly verify that operations like `getLiveStatus` are deterministic. Seeded PRNGs ensure that repeated calls yield identical, testable outputs.
   - **Immutability:** Tests verify that caching layers return deep clones, preventing callers from accidentally corrupting shared state.

2. **Offline Engine Tests (`src/offline/`)**
   - **Target:** 100% coverage.
   - **Intent Validation:** Keywords are verified using word-boundary matching across English, Spanish, and French, avoiding false positives.
   - **Priority Resolution:** Verifies that declared user profiles override detected intents correctly.
   - **Template Integrity:** Fails hard if unrendered placeholders (e.g., `{venue}`) leak into the final output. This enforces that the fallback responses are always complete and grammatically safe for screen readers.

## Future Layers
As the AI/Assistant layers and Express API routes are integrated, testing will focus on integration and end-to-end functionality, but the core domain logic will remain thoroughly protected by these deterministic unit tests.
