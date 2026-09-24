# See in the Sea

Underwater photography contest site: entrants upload photos, pay an entry fee,
and an admin judges the entries. Astro + React 18 + Tailwind v4 on Cloudflare
Workers, with D1, R2 and Clerk. Bun is the package manager.

## Commands

```
bun run dev          # astro dev (port 4321)
bun run lint         # biome check .
bun run type-check   # tsc --noEmit
bun run check        # astro build && tsc && wrangler deploy --dry-run
```

Run `bun run lint` and `bun run type-check` before calling work done.

## Judging offline (read this when the owner asks about a local evaluation)

The owner judges the contest from his laptop while screen sharing over Zoom, so
photos load from disk and the shared Cloudflare account takes no load. The whole
procedure, including the mid-contest rehearsal he usually asks for first, is in
**`docs/offline-judging.md`**. Read it before answering anything about it.

The short version: `bun run judging:pull` mirrors production D1 and the R2
photos locally, `PUBLIC_JUDGING_MIRROR=true` in `.env` makes the app read that
mirror, and `bun run judging:push` sends the judging back to production
(dry run by default, `--apply` to write). Pull, judge, push, in that order:
a pull always resets the local judging tables, so pulling after judging
destroys the work. Rehearsal flags must never be pushed.

## Conventions

- Theme tokens only (`background`, `surface`, `foreground`, `muted-foreground`,
  `border`, `accent`, `success`, `warning`, `destructive`, `gold`...). No
  Tailwind palette colours, no `text-white`, no hex, no emoji in the UI.
- Mobile first, `gap` over margins, 44px tap targets (`min-h-11`).
- TypeScript strict, no `any`, `function` keyword, `type` over `interface`,
  named exports only. Business logic in hooks; `.tsx` files render.
- Shared primitives in `src/react/components/ui/` (Button, Card, Badge, Input,
  Eyebrow, `cn`). `BaseModal` for dialogs.
- The public site and the entrant pages are translated through
  `src/i18n/translations.ts` (keys must exist in `en` and `it`). The admin area
  is deliberately untranslated Italian.
- Never surface the upload size limit in the UI: the published rules say 5MB
  while the app accepts more.
