# TrialMatch AI

A clinical trial matching platform that combines real-time data from ClinicalTrials.gov with Claude AI to help patients and clinicians find relevant oncology trials.

---

## How it works

1. **Enter a patient profile** — condition, biomarkers, disease stage, ECOG performance status, age, sex, and location.
2. **Rule-based scoring** runs instantly across up to 200 real trials fetched live from ClinicalTrials.gov, ranking each on a 9-factor weighted algorithm (condition match, biomarkers, location, age, sex, ECOG, stage, phase, NLP keywords).
3. **Claude AI analysis** then reads the actual eligibility criteria text for the top 10 results and reasons about whether this specific patient qualifies — returning a recommendation, confidence score, key strengths, and specific concerns.
4. **Browse, filter, and save** results across the Results, Analytics, and Saved tabs.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, Motion |
| AI | Claude Sonnet (`claude-sonnet-4-6`) via Anthropic SDK |
| Backend | Express 5, Node.js (ESM) |
| Data | ClinicalTrials.gov API v2 (public, no key needed) |
| UI components | Radix UI, shadcn, Lucide React |

---

## Getting started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Install

```bash
git clone <repo-url>
cd trialm
npm install
```

### Configure

Set your Anthropic API key in your terminal before starting:

```bash
# macOS / Linux
export ANTHROPIC_API_KEY=sk-ant-...

# Windows (Command Prompt)
set ANTHROPIC_API_KEY=sk-ant-...

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

### Run

```bash
npm run dev:all
```

This starts both the Express backend (port 3001) and the Vite dev server (port 5173) together. Open [http://localhost:5173](http://localhost:5173).

To run them separately:

```bash
npm run server   # Express API on :3001
npm run dev      # Vite frontend on :5173
```

---

## Sample profiles

Three preloaded profiles are available in the UI for quick testing:

- **EGFR+ NSCLC** — Non-small cell lung cancer with EGFR mutation, Stage IV
- **HR+ Breast Cancer** — Hormone receptor-positive breast cancer
- **Newly Dx Myeloma** — Newly diagnosed multiple myeloma

---

## Project structure

```
trialm/
├── server.js                     # Express backend — Claude API endpoint
├── src/
│   ├── App.jsx                   # Root layout, hero, section routing
│   ├── hooks/
│   │   └── useClinicalTrials.js  # Fetching, scoring, AI enrichment
│   ├── utils/
│   │   ├── matchingAlgorithm.js  # 9-factor rule-based scorer
│   │   └── nlpKeywords.js        # Keyword extraction for NLP boost
│   └── components/
│       ├── ClinicalTool.jsx      # Tabbed shell (Profile / Results / Analytics / Saved)
│       ├── PatientProfileForm.jsx
│       ├── ResultsPanel.jsx
│       └── TrialCard.jsx         # Trial card with AI analysis section
```

---

## API

The backend exposes a single endpoint used by the frontend:

### `POST /api/analyze-trials`

**Body:**
```json
{
  "profile": {
    "condition": "Non-Small Cell Lung Cancer",
    "age": 58,
    "sex": "MALE",
    "ecog": 1,
    "diseaseStage": "Stage IV",
    "biomarkers": ["EGFR mutation"],
    "location": "Boston, MA"
  },
  "trials": [ ]
}
```

**Response:**
```json
[
  {
    "nctId": "NCT12345678",
    "recommendation": "strong_match",
    "confidence": 88,
    "reasoning": "Patient meets EGFR mutation requirement and ECOG ≤1 threshold specified in inclusion criteria.",
    "key_strengths": ["EGFR mutation confirmed", "ECOG 1 within range", "Stage IV eligible"],
    "key_concerns": ["Prior platinum therapy required — not specified in profile"]
  }
]
```

`recommendation` is one of `strong_match`, `possible_match`, or `unlikely_match`.

---

## License

MIT
