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

## API Layer Defenses
To protect the web layer and endpoints, we employ several strict middleware patterns:

### 1. Zod Validation
All input hitting `/api/chat` is strongly typed and validated against `ChatRequestSchema`.
- Unknown properties are actively stripped using `.strict()`, entirely preventing prototype pollution vectors.
- Raw validation trace arrays are stripped out of user-facing responses to prevent leaking backend data structures.

### 2. HTTP Security Headers
Every request passing through Express runs through `securityHeaders`, applying:
- `Content-Security-Policy: default-src 'self'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-Frame-Options: DENY`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 3. Statelessness Guarantee
We strictly follow a stateless design. Message bodies (user input) are never persisted to a database or written to logs. This guarantees compliance with strict data minimization policies and mitigates privacy risks regarding PII entered into the chat.

### 4. Same-Origin Policy (No CORS)
By design, this backend runs on the same origin as the frontend. We explicitly omit any `cors` middleware, inherently closing off cross-site access from unauthorized domains.

### 5. Memory-Bounded Rate Limiting
A custom in-memory token bucket rate limiter is applied to `/api/chat` to prevent AI endpoint exhaustion:
- Defaults to 5 requests per 10 seconds.
- Automatically tracks limits via IP addressing.
- Implements an eviction mechanism when the internal Map exceeds 1,000 unique IP addresses, actively pruning refilled buckets or resetting completely under a sudden DDoS scenario.
