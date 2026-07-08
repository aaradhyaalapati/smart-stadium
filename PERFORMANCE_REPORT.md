# Performance & Reliability Report

## Explicit Timeout Barricades
A core principle of the `liveEngine` is that an AI request must never block infinitely. We have placed an explicit `8000ms` race timeout around the Gemini `generateContent` invocation.
- **Rationale:** Without a timeout, a hanging connection to Google's servers could tie up the Node.js event loop or block a response indefinitely. If the timeout is breached, the engine catches it and silently hands off to the zero-latency offline engine.

## Iteration Caps
The `liveEngine` employs a manual `while`/`for` tool loop with a hard cap of `8` iterations.
- **Rationale:** Large Language Models can occasionally get stuck in cyclical tool-calling loops (e.g., repeatedly querying `getVenueInfo` and ignoring the result). 8 iterations is sufficient for the most complex scenario (`planVisit` -> `getLiveStatus` -> `findAccessibleServices`), while explicitly cutting off runaway costs and latencies.

## Prefix Cacheability via Frozen Prompts
The `SYSTEM_PROMPT` is a module-level constant string. We explicitly do not interpolate variables (like `{venueId}` or `{language}`) into the system instructions.
- **Rationale:** Maintaining a byte-stable system prefix maximizes the chances of hitting Gemini's context caching tier over time. Variable state is passed strictly via the user's message turn history, drastically improving the engine's token processing speed at scale.
