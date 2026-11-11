# Wiring views to the API

The Dashboard (`src/app/page.tsx`) is the worked example. Every other view follows
the same pattern. The API client (`src/lib/api.ts`) returns `null` when the backend
is absent or a fetch fails, so each view falls back to its bundled mock data and the
app always runs standalone.

## Pattern (server components — companies, themes, government, event detail)
```tsx
import { api } from "@/lib/api";
import { companies as mockCompanies } from "@/data/mock";

export default async function Companies() {
  const data = await api.companies();          // null if no backend
  const rows = data ?? mockCompanies;          // fall back to mock
  // ...render rows exactly as before
}
```

## Pattern (client components — search, graph)
These are `"use client"`, so fetch in a `useEffect` and seed state with mock:
```tsx
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { events as mockEvents } from "@/data/mock";

const [results, setResults] = useState(mockEvents);
useEffect(() => {
  (async () => {
    const data = await api.search(query);
    if (data) setResults(data);
  })();
}, [query]);
```

## To go live
1. Backend running on :8000 with the DB seeded.
2. Frontend `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. `npm run dev` — views now render Postgres data.

Leave `NEXT_PUBLIC_API_URL` unset and everything renders mock data, unchanged.

## Endpoint map (view → client call)
| View              | Call                       |
|-------------------|----------------------------|
| Dashboard         | `api.today()`              |
| Watchlist         | `api.companies()` (filter watched) |
| Companies         | `api.companies()`          |
| Company profile   | `api.company(id)`          |
| Themes            | `api.themes()`             |
| Theme detail      | `api.theme(id)`            |
| Government        | `api.government()`         |
| Event detail      | `api.event(id)`            |
| Graph             | `api.graph()`              |
| Search            | `api.search(q)`            |
| Alerts            | `api.alerts()`             |
