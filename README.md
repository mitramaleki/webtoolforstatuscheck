# Company Status Researcher

A browser-based tool to research the current status of companies using AI-powered web search (Claude + Anthropic API).

## What it does

Paste a list of company names (and optionally their old/known URLs), configure filters, and the tool will search the web for each company to determine:

- **Current status** — Active, Closed, Merged/Acquired, or Renamed
- **New URL** — if the company rebranded or moved domains
- **Country** — where the company is based
- **Type** — whether it is a headhunter/poster/recruitment firm, or a normal company
- **Notes** — a short factual summary of what changed

Results can be exported as **CSV** (for Excel) or a **TXT report** grouped by status.

## Setup

### 1. Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** → select `main` branch, `/ (root)` folder
3. Your site will be live at `https://<your-username>.github.io/<repo-name>/`

### 2. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key
3. In the tool, click **Settings** and paste your key

Your key is stored only in your browser's `localStorage` — it is never sent anywhere except directly to `api.anthropic.com`.

## Usage

1. **Input setup** — paste company names (one per line). Optionally paste matching previous URLs in the right box.
2. Set country and company type filters.
3. Click **Start research** — the AI searches the web for each company in real time.
4. **Results** — filter by status, country, or type. Export as CSV or TXT.

## Country coverage

Americas: USA, Canada, Mexico, Brazil, Argentina, Colombia, Chile

Western Europe: Germany, UK, France, Netherlands, Belgium, Switzerland, Austria, Spain, Portugal, Italy, Ireland, Luxembourg

Northern Europe: Sweden, Norway, Denmark, Finland, Iceland

Eastern & Southern Europe: Poland, Czech Republic, Hungary, Romania, Slovakia, Ukraine, Russia, Greece, Croatia, Serbia, Slovenia, Bulgaria

## Notes

- Uses Claude claude-sonnet-4-6 with web search enabled
- Concurrency 2–3 recommended to avoid API rate limits
- For very large lists (1000+), run in batches of ~200
