# Smart Stadium Assistant

Welcome to the **Smart Stadium Assistant** — an AI-powered conversational platform designed to enhance the accessibility and navigation of large stadium venues. Built initially with a focus on fans with disabilities, the Assistant dynamically adapts to user profiles to deliver relevant, precise information in both connected (live) and disconnected (offline) environments.

## The Core Value Proposition: Accessibility First
Navigating a stadium can be overwhelming. For users with specific accessibility needs (e.g., wheelchair users, visually impaired fans), accurate real-time information isn't just convenient—it's essential. 

The Assistant supports user profiles defining:
- **Language Preference** (English, Spanish, French)
- **Specific Needs** (Wheelchair access, Braille, Sign Language)
- **Venue Context** (MetLife Stadium, Estadio Azteca, BMO Field)

This profile fundamentally changes how the AI responds, acting as a specialized concierge for each fan.

## Architecture: The Live vs. Offline Strategy

The defining technical constraint for stadium environments is network congestion. During major events (halftime shows, final whistles), cellular networks frequently degrade or collapse. To solve this, the Smart Stadium Assistant employs a **Dual-Mode Engine**.

### 1. The Live AI Engine (Primary Mode)
When the network is available and the API key is active, the assistant runs on the **Live Engine**.
- **Model**: Powered by `gemini-1.5-flash`, balancing high speed with tool-calling capabilities.
- **Tooling**: The LLM dynamically triggers internal server tools (e.g., `getVenueInfo`, `getAccessibleServices`) to query the backend database and inject live constraints before answering the user.
- **Resilience**: Operates on a strict 8-second timeout. If the LLM loops excessively or times out, the system automatically catches the error and degrades gracefully to the offline engine.

### 2. The Offline Fallback Engine (Safety Net)
When the API is unreachable, the request seamlessly routes to the **Offline Engine**.
- **Rule-Based Matching**: Employs rapid Regex-based intent classification for core needs: Navigation, Food, Restrooms, and Medical.
- **Template Generation**: Responses are populated via deterministic templates.
- **User Transparency**: The UI uses `ModeIndicator.tsx` to instantly signal to the user whether they are chatting with the "Live AI Mode" or the "Offline Fallback Mode", maintaining trust.

## Testing & Quality Assurance

We treat quality and stability as features. This repository enforces:
- **100% Test Coverage**: Both the React frontend and Express backend are rigidly tested. We do not accept PRs that lower coverage below 100%.
- **End-to-End Validation**: Our CI suite validates the full lifecycle (seed data → offline fallback check → AI failure simulation → live success path).
- **Static Analysis**: Enforced strictly via ESLint, Oxlint, and TypeScript's `verbatimModuleSyntax`.

## Getting Started

### Prerequisites
- Node.js 20+
- A Google Gemini API Key (optional for offline testing)

### Installation
1. Clone the repository and install root dependencies:
   ```bash
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Set your environment variable:
   ```bash
   export GEMINI_API_KEY="your-key-here"
   ```

### Running Locally
To launch the backend server and frontend Vite environment concurrently:
```bash
# In the root directory (Backend)
npm run dev

# In the frontend directory
npm run dev
```

The application will be available at `http://localhost:5173`.

## CI/CD and Security
- **CI**: Our GitHub Actions pipeline (`.github/workflows/ci.yml`) strictly enforces linting, typechecking, 100% coverage thresholds, and production builds.
- **Security**: The Express backend uses `helmet` for Security Headers, and `express-rate-limit` to prevent abuse. Our robust Zod schema validation explicitly rejects unknown fields (`strict()`), mitigating prototype pollution attacks.

## Final Note
The Smart Stadium Assistant isn't just a wrapper around an LLM; it's a fault-tolerant system built for the harsh realities of real-world venue infrastructure.
