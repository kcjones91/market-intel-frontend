# market-intel-frontend (Munny Moves frontend)

Read this first in every session. It is the current state of the project; anything in a zip,
handoff doc or chat summary that disagrees with this file or with `git log` is stale.

## Source of truth

- Code: this repo, `main`. A version is a git tag `vX.Y.Z`. The current release is the
  newest tag (`git tag --sort=-v:refname | head -1`); the version that is live is the pin below.
- Deploy: a pushed tag runs `.github/workflows/build.yml`, which builds, smoke-tests and pushes
  `ghcr.io/kcjones91/market-intel-frontend:<tag>`. The running version is the tag pinned in
  `kcjones91/k8s-applications` at `apps/market-intel/03-frontend.yaml`; ArgoCD syncs it to
  swipe-lab (namespace `market-intel`, Deployment `intel-web`).
- Live: https://intel.munnymoves.com, behind Cloudflare Access (email one-time PIN, allow list).
  It is also served inside the home network and tailnet; details are in `k8s-applications`.
  Which build is serving:
  `kubectl -n market-intel get deploy intel-web -o jsonpath='{.spec.template.spec.containers[0].image}'`
- Kyle's clones (WSL): `/mnt/c/Users/kjon5/projects/market-intel-frontend` and
  `/mnt/c/engex/code/k8s-applications`. kubectl and argocd run on the cluster's control node.

## Architecture in one paragraph

Next.js 14 App Router, TypeScript, Tailwind, npm, built as a standalone server. Every route is
rendered per request (`dynamic = "force-dynamic"` in the root layout). Server views call the
FastAPI backend (`kcjones91/market-intel-backend`, Service `intel-api`) using `API_INTERNAL_URL`,
read at runtime. Browser views (Search, Graph, the context rail) call same-origin `/api/*`, which
`src/app/api/[...path]/route.ts` forwards to the backend: an allowlist of the read endpoints the UI
uses plus POST `/api/search`, nothing else. A new backend route needs adding there. `src/lib/api.ts`
returns data, `null` (no API configured; also a 404 on a single-record call) or throws (API
configured but failing, including a 404 on a list endpoint). Mock data
in `src/data/mock.ts` renders only when no API is configured, under a site-wide SAMPLE DATA banner;
a failing API shows an error, never mock. No auth in the app itself: Cloudflare Access is the gate. The backend ingests Congress.gov
and SEC EDGAR nightly and scores events with a local LLM. The Munny Moves newsletter is a
separate pipeline. `WIRING.md` has the view to endpoint map.

## Rules

- `npx tsc --noEmit` and `npm run build` pass before any commit. There is no test suite and no
  lint config yet (`npm run lint` is unconfigured); do not claim tests passed.
- When tests exist, they never depend on today's date or the network. Pin the clock, mock fetch.
- No Co-Authored-By or Claude-Session lines in commits or PRs.
- No em dashes in prose, UI copy or docs.
- When handing changes to Kyle, give the full command sequence (apply, build, commit, push, tag,
  bump the pin, sync, verify the live page) with his real paths, not only file contents.
- Secrets never reach the client bundle. `NEXT_PUBLIC_` is public; everything else stays
  server-side. This app holds no secrets today; keep it that way.
- This is a finance product. Numbers shown to readers come from data, never from a model's
  prose, and nothing on the site reads as personal investment advice. Sample data never appears
  as live data.
- Design tokens: colours and font stacks in `tailwind.config.ts`, base styles in
  `src/app/globals.css`. Type sizes and spacing are inline Tailwind values, with no scale file
  yet. One dark theme only. Minimum text size is 12px. Greys: `sub` and `muted` for text,
  `faint` for separators only. `neg` and `pos` mean loss and gain; importance never uses `neg`.
- Every term a reader sees (a score, a label) has one definition in `src/lib/glossary.ts`, shown
  by the `Help` component ("?"). Do not explain a term in page copy; add or edit the entry.

## How changes ship

Claude works on a branch, runs the checks above (and `scripts/ui_smoke.py` for anything visual),
then has the review agents go over the diff and fixes what they find. It pushes and opens a PR
with `gh api repos/kcjones91/market-intel-frontend/pulls` (`gh pr create` uses GraphQL and is
blocked from sessions). Once `check.yml` is green on the PR, Claude merges it (Kyle asked for
this on 2026-11-11) and tells Kyle what merged. A red gating job or an unresolved review finding
means no merge. `check.yml` runs again on `main`.

Release (after merge, never from an unmerged branch): sessions cannot push tags, so Kyle runs
`git pull && git tag vX.Y.Z && git push origin vX.Y.Z && gh run watch`. When the build is green,
change the image tag in `k8s-applications/apps/market-intel/03-frontend.yaml`, commit, push,
`argocd app sync market-intel --core`, then check `/healthz` and `/api/health` on the live host.

## Agents (`.claude/agents/`)

- `test-qa`: reviews diffs for untested paths and fragile tests; runs typecheck and build.
- `ui-qa`: runs `scripts/ui_smoke.py` (390 and 1440, both colour schemes), reviews screenshots.
- `security-review`: dependency audit plus the diff against the trust boundaries.
- `ui-design`: runs before code on anything a reader sees. Phone first; returns a short spec
  (layout, interactions, states, copy) that the main session builds and `ui-qa` checks against.

Only the main session writes code. `ui-design` specifies, the other three review and report;
they run with fresh context so the work is not grading itself.

## Open items (keep short, prune when done)

- No tests. First candidates: `src/lib/api.ts` return contract, the alerts normaliser, graph layout.
- `npm audit --omit=dev` reports Next.js advisories whose fix is a major upgrade (14 to 16). The
  image optimizer is off, which removes the worst of them. Node 20 in the Dockerfile is end of life.
- Backend stores the Congress data API address as `docUrl`; `src/lib/links.ts` maps it to the
  public bill page at render time, and links only to the hosts listed there. Fix at the source in the Congress worker, then backfill.
- Ask the Analyst is removed until it works. Reports and World Events are out of the nav.
  Alerts: the live page shows a "not switched on yet" notice (`ALERTS_ARE_LIVE` in
  `src/app/alerts/page.tsx`) because the only rules and firings in the backend are seed rows.
  In sample mode "+ New rule" and the rule toggles are still dead. Watch stars are not toggles.
- Graph is hard to read on phones. Tags and breadcrumb links are under the 40px touch target.
- UI second pass: heat still uses the gain colour, internal ids in breadcrumbs, price formatting.
- Heat is shown on live pages (`HEAT_IS_CALCULATED` in `src/lib/heat.ts`) and needs backend
  v0.2.8 or later, whose nightly heat job calculates it. The glossary's heat entry mirrors that
  job's defaults (7 day window, 2 day half life); if they are tuned, update the entry.
- `build.yml` still uses `actions/checkout@v4`; `check.yml` uses v7.
- Cloudflare: move munnymoves.com to its own Cloudflare account, with its own login branding.
- Stage 2: per-reader watchlists and alerts, identity from the Cloudflare Access header.
