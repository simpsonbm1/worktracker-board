# worktracker-board

Board UI for [worktracker](https://github.com/simpsonbm1/worktracker) — a personal
cross-project work tracker.

## This repository is PUBLIC and contains NO DATA

**Never commit tracker content here — no items, no inbox notes, no `projects.yml`, no
exported JSON, no screenshots of the board.** This repo holds only the HTML/CSS/JS
shell.

The reason for the split: GitHub Pages cannot serve a site from a private repository on
a personal Free account, and paying does not fix it — publishing a Pages site *privately*
requires an organization account on GitHub Enterprise Cloud. So the page itself must be
public, and the private data is fetched at runtime instead of being built into the page.

## What's in here

| File | Purpose |
|---|---|
| `index.html` | The whole app — tokens, styles, and logic inline. No build step. |
| `sw.js` | Service worker. Caches the shell **only**; never touches `api.github.com`. |
| `manifest.webmanifest`, `icon.svg` | PWA install metadata. |

Run it locally with any static server (`py -m http.server 8322`) — `file://` will not
work, because service workers and the API layer both need an http origin.

Two rules that are load-bearing rather than stylistic:

- **Writes are in-place frontmatter line edits, never a parse-and-re-serialise.**
  `tools/wt.ps1` in the private repo owns the canonical serialisation. If this page
  re-emitted whole files, its formatting would drift from the CLI's writer and every
  board move would churn the diff. It rewrites only the specific line it is changing.
- **Board commits are prefixed `board:`** so provenance is visible beside the CLI's own
  `wt:` commits in the log.

The CLI's gates are mirrored in the UI: a `needs-test` item has no raw "done" action,
only Confirm — which appends the same evidence line `wt confirm` writes — and Send back.

## How it works

The page asks once for a fine-grained personal access token scoped to the
`worktracker` repository (contents: read/write) and keeps it in `localStorage`. It then
reads item files and writes inbox captures through the GitHub REST API, directly from
the browser. No server, no backend, and the data never passes through this repository.

The token stays on your device. Revoke it at any time from GitHub → Settings →
Developer settings → Personal access tokens; it can reach nothing but that one repo.
