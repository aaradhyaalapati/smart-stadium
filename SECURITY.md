# Security Review: Smart Stadiums Assistant

## API Key Handling
The single piece of highly sensitive configuration in this application is the `GEMINI_API_KEY`.
- **Validation:** Checked securely at runtime in `src/assistant/index.ts`.
- **Visibility:** The key exists entirely within the backend environment variables. It is completely isolated from `src/api` routes or frontend responses, avoiding any potential leaks.
- **Graceful Failure:** If the key is omitted or invalid, the backend does not crash or leak stack traces. It immediately trips into the deterministic offline mode, hiding the configuration issue from the end user.

## Fallback Trigger List
We explicitly catch and handle external connectivity and auth errors:
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found (Model endpoint moved)
- `429` Too Many Requests (Rate limit hit)
- `>= 500` Server Errors
- Network fetch failures and specific Timeout aborts.

## Strict Rethrows (The `400` Rule)
We **do not** swallow `400 Bad Request` exceptions. 
A `400` indicates a structural, malformed flaw in our request payload (e.g., misconfigured schema mappings). Masking this with an offline fallback makes discovering fundamental integration bugs significantly harder. Therefore, a `400` will be re-raised to log visibly in the server metrics and halt processing cleanly.
