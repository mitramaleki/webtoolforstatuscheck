# Company Status Researcher

A web-based tool to research the current status of companies (active, closed, merged, renamed) using free APIs instead of paid Anthropic Claude.

## Features

- Input list of company names (and optional previous URLs)
- Filter by country/region
- Filter by company type (normal vs. poster/headhunter)
- Adjustable concurrency (how many companies researched in parallel)
- Real-time results table while research runs
- Export results to CSV or TXT
- All processing done client‑side except a lightweight backend that provides free web search and summarization

## How it works

The frontend (HTML/JavaScript) collects the company list and sends each company to a custom backend endpoint (`/api/search/v1/messages`). This endpoint:

1. Uses the **DuckDuckGo Instant Answer API** (no key required) to gather a short abstract, related snippets, and a first result URL for the company.
2. Sends that raw data to a free **Hugging Face Inference API** model (`google/flan-t5-large`) with a prompt that asks it to produce a JSON object containing:
   - `status`: "active", "closed", "merged", "renamed"
   - `newUrl`: the current URL if the company rebranded or changed domain
   - `country`: exact country name (e.g., "Germany")
   - `isPoster`: true if the company is a recruitment/headhunter/staffing firm
   - `notes`: a 1‑2 sentence factual summary
3. Returns the JSON in the same shape that the original Anthropic API would have returned, so the frontend needs no changes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended) – for running the backend
- A free **Hugging Face** account and an access token (optional but raises rate limits). Get one at https://huggingface.co/settings/tokens

### Backend Setup

1. Clone/download this repository.
2. Open a terminal in the `backend` folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the `backend` folder (copy the example below) and add your Hugging Face token if you have one:
   ```
   HF_API_TOKEN=hf_yourtokenhere
   PORT=3000   # optional, defaults to 3000
   ```
5. Start the server:
   ```bash
   npm start
   ```
   The backend will be available at `http://localhost:3000`.

### Frontend

- The `index.html` file is the entire frontend. Open it directly in a browser (double‑click) – no build step needed.
- If you opened the file via `file://`, the fetch to `/api/search/v1/messages` will be a relative request and will only work if you serve the HTML from the same origin as the backend (e.g., both served from `localhost:3000` or both via `file://`).  
  For simplest local testing, you can run a tiny static server in the project root:
  ```bash
  # from the repository root (where index.html lives)
  npx serve   # or any static file server on port 8080
  ```
  Then open `http://localhost:8080` and make sure the backend is running on `http://localhost:3000` (the default port). The relative URL `/api/search/v1/messages` will resolve to `http://localhost:8080/api/search/v1/messages` **only if** the frontend and backend share the same origin and port.  
  To avoid CORS/port issues, the easiest is to serve both from the same port using a proxy, or update the fetch URL in `index.html` to point directly to your backend, e.g.:
  ```js
  const response = await fetch('http://localhost:3000/api/search/v1/messages', { … });
  ```
  (You can edit the `searchCompany` function in the `<script>` section.)

### Using the Tool

1. Paste company names (one per line) into the **Company names** textarea.
2. (Optional) Paste known previous URLs in the same order into the **Previous / known URLs** textarea.
3. Select countries you want to include (leave all unchecked for worldwide).
4. Choose company type filter: **All**, **Poster / headhunters only**, or **Normal companies only**.
5. Set the concurrency slider (1‑5). Higher = faster but may hit rate limits on the free HF API.
6. Click **Start research**.
7. Watch the progress bar and live results table.
8. When finished, use **Download CSV** or **Download TXT** to export the filtered results.

### Production Deployment

- Deploy the backend to any Node‑hosting service (Render, Railway, Fly.io, Vercel serverless, etc.). Make sure to set the `HF_API_TOKEN` environment variable if you have one.
- Serve the `index.html` alongside the backend (same origin) or enable CORS on the backend and point the fetch to the full URL.

## License

MIT – feel free to fork and improve.

---

**Note**: The free Hugging Face Inference API has rate limits. For heavy usage consider self‑hosting a small model or using a paid inference endpoint. The DuckDuckGo Instant Answer API is free and generous for light‑to‑medium use.

--- 

Enjoy researching companies without paying for an LLM API!