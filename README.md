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

## How it works

The page asks once for a fine-grained personal access token scoped to the
`worktracker` repository (contents: read/write) and keeps it in `localStorage`. It then
reads item files and writes inbox captures through the GitHub REST API, directly from
the browser. No server, no backend, and the data never passes through this repository.

The token stays on your device. Revoke it at any time from GitHub → Settings →
Developer settings → Personal access tokens; it can reach nothing but that one repo.
