# isolved + Nayya Intelligence — Chat Prototype

A static HTML/CSS/JS prototype that layers a scripted AI chat widget onto the isolved benefits experience. Built as a visual stand-in to showcase the Nayya Intelligence chat flow.

**Live demo:** https://clifton-nayya.github.io/isolved-nayyaintelligence-demo/

---

## What's in here

| Page | Path |
| --- | --- |
| Home | `/` |
| My Benefits | `/benefits/benefits-summary.html` |
| Benefit Enrollment | `/benefits/enrollment.html` |
| Qualifying Life Events | `/benefits/life-events.html` |

The chat widget is injected on every `/benefits/*` page and retains its state across navigation (via `sessionStorage`).

## Chat widget

### Two skins

**Default** — floating bottom-right panel, pink isolved branding. Active by default.

**Titan (embedded)** — centered welcome screen with suggestion tiles, Nayya-style avatar response layout. Activate by appending `?embedded` (or `?embedded=1`) to any benefits URL. A swap-icon toggle in the chat header switches between skins seamlessly; skin choice persists across navigation via `sessionStorage`.

Example: https://clifton-nayya.github.io/isolved-nayyaintelligence-demo/benefits/benefits-summary.html?embedded=1

### Responses

All responses are keyword-matched against scripted content. Source of truth is the Notion page **Isolved Prototype Chat Script**.

| Trigger phrases | Response |
| --- | --- |
| `enrolled`, `my benefits`, `signed up` | Current benefits enrollment summary |
| `eligible`, `eligibility`, `employer offer`, `available to me` | Full list of eligible benefits |
| `emergency room`, `emergency`, `ER` | ER cost breakdown under the enrolled plan |
| `doctor`, `provider`, `primary care` | In-network provider list (NYC 10001) |

Anything that doesn't match a rule gets a friendly fallback.

### Editing the script

Edit `assets/js/chat-script.js`:
- `suggestions` — default skin's 3 quick-pick buttons
- `suggestions_titan` — Titan skin's 4 tiles (no thumbnails)
- `flows` — named sequences of bot responses
- `match` — regex → flow rules applied to free-text input
- `fallback` — default response when no rule matches

Push to `main` and Pages rebuilds in ~30–60s.

### Reset the chat state

In the browser console on any `/benefits/*` page:

```js
BenefitsChat.reset()
```

## Running locally

No build step. Any static server works:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000/`.

## Project structure

```
.
├── index.html                     # Home
├── benefits/
│   ├── benefits-summary.html
│   ├── enrollment.html
│   └── life-events.html
└── assets/
    ├── css/style.css              # All styles (shared + chat + both skins)
    └── js/
        ├── layout.js              # Injects topbar, sidenav, subnav, flyout
        ├── chat.js                # Chat widget, skin toggle, persistence
        └── chat-script.js         # Scripted responses (editable)
```

## Deploying updates

```bash
git add . && git commit -m "your message" && git push
```

GitHub Pages rebuilds automatically from `main`.
