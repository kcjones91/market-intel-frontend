# How the views get their data

Every view is wired to the API. Bundled mock data is used only when no API is
configured at all, so the app still runs standalone for design work.

## Data flow

- **Server views** (Dashboard, Watchlist, Companies, Themes, Government, Alerts,
  and the detail pages) call the backend directly from the Next.js server using
  `API_INTERNAL_URL`. That variable is read at runtime, so the same image works
  in any environment.
- **Browser views** (Search, Graph, and the right-hand context rail) call
  same-origin `/api/*`. `src/app/api/[...path]/route.ts` forwards those requests
  to the backend. No backend address is compiled into the bundle.

## Return contract (`src/lib/api.ts`)

| Result  | Meaning                                              | What the view does        |
|---------|------------------------------------------------------|---------------------------|
| data    | The API answered                                     | Render it                 |
| `null`  | No API configured, or the API returned 404           | Mock data, or a 404 page  |
| throws  | An API is configured but failed                      | Error state, never mock   |

Mock data is never shown when an API is configured. Sample numbers must not be
mistaken for live ones.

## Configuration

| Where            | Setting                                                            |
|------------------|--------------------------------------------------------------------|
| Cluster          | `API_INTERNAL_URL=http://intel-api.market-intel.svc.cluster.local` |
| Local dev        | `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000` (still honored) |
| Standalone/mock  | Leave both unset                                                   |

## Endpoint map (view -> client call)

| View              | Call                                              |
|-------------------|---------------------------------------------------|
| Dashboard         | `api.today()`                                     |
| Watchlist         | `api.companies()` + `api.today()`                 |
| Companies         | `api.companies()`                                 |
| Company profile   | `api.company(id)`                                 |
| Themes            | `api.themes()`                                    |
| Theme detail      | `api.theme(id)`                                   |
| Government        | `api.government()`                                |
| Government detail | `api.government()` + `api.companies()` + `api.today()` (no detail endpoint yet) |
| Event detail      | `api.event(id)`                                   |
| Graph             | `api.graph()`                                     |
| Search            | `api.search(q)`                                   |
| Alerts            | `api.alerts()`                                    |
| Context rail      | `api.companies()` + `api.themes()`                |

## Not wired (by design, for now)

- Reports and World Events are still placeholders.
- "Ask the Analyst" and the "+ New rule" button are not functional yet.
