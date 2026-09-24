# Offline judging session

Run the "Valutazione" flow entirely on your laptop: photos load from disk, the
shared Cloudflare account takes no load, and conference wifi cannot ruin the
session. Production is read during the prep and written once at the end.

## What lives where

- **Local D1** (`.wrangler/state/v3/d1`) holds the snapshot: contest, categories,
  judges, payments, **every** submission of the contest, and any judging already
  done. It has to be every submission: `judging_flags` and `results` are foreign
  keys onto `submissions`, and the push clears those tables for the whole
  contest, so the two sides must cover the same rows. The paid-author filter
  decides only which **photos** are downloaded.
- **`public/judging/`** holds the photos: `thumb/` (1200px webp, used by the
  grids) and `full/` (full resolution webp, used by fullscreen and 5x zoom).
  Gitignored, and **must be deleted before any build or deploy** or `astro build`
  copies gigabytes into `dist/`: `bun run judging:clean`.
- **`.judging-push/`** keeps the SQL of every push, so a run that dies halfway
  can be re-applied by hand.

## Before the session

1. **Snapshot production** (after the upload deadline, so nothing is missing):

   ```
   bun run judging:pull                 # contest uw-2026
   bun run judging:pull -- --dry-run    # see what it would take first
   ```

   Reruns are safe: photos already downloaded are skipped unless `--override`.
   Check the printed submission count against what the live admin shows.

2. **Switch the app to the mirror.** Add to `.env`:

   ```
   PUBLIC_JUDGING_MIRROR=true
   ```

   Without it, local pages keep using the stand-in photos that make normal dev
   work possible (the mirror is not checked in). Restart the dev server after
   changing it, and remove it when you go back to ordinary development.

3. **Sign in to Clerk once** in the browser you will share. It is the only part
   of the session that needs the network.

4. **Rehearse** (see below) at least once on a day that is not the session.

## During the session

```
bun run dev
```

Open `/admin/judging`. Flags, placements, reordering and the fullscreen viewer
all read and write the local database. Nothing touches Cloudflare.

Do **not** re-run `judging:pull` during or after judging: it replaces the local
contest rows and would destroy the work. Pull, judge, push, in that order.

## After the session

```
bun run judging:push                  # dry run: prints counts and the SQL path
bun run judging:push -- --check-remote  # read-only: verifies the snapshot is not stale
bun run judging:push -- --apply         # asks you to type the contest id
```

The push deletes and reinserts `judging_flags` and `results` **for uw-2026
only**, prints production counts before and after, and refuses to run when the
local database has nothing to push. Re-applying the same file is idempotent.

Finally, clear the mirror before any deploy:

```
bun run judging:clean
```

## Mid-contest rehearsal (the usual case)

Rehearsing while the contest is still open is the right way to find problems
early. It is safe, with one rule: **never push what you judged in a rehearsal.**

1. `bun run judging:pull` - takes whatever is in production right now.
2. Add `PUBLIC_JUDGING_MIRROR=true` to `.env`, restart `bun run dev`.
3. Judge freely at `/admin/judging`: flag, place, reorder, zoom. This is the
   moment to check that photo quality and scrolling feel right on the machine
   you will share.
4. `bun run judging:push` (dry run only) to confirm the SQL looks sane. **Do not
   pass `--apply`**: those flags are practice, and the push would overwrite the
   real contest's judging with them.
5. When the contest closes, **pull again**. That replaces the local contest rows
   wholesale, wiping the rehearsal flags, and brings the late entries in. Only
   then judge for real and push with `--apply`.

If you are unsure whether the local database still holds rehearsal work, pull
again: it is idempotent for photos (already downloaded ones are skipped) and it
always resets the judging tables from production.

## Rehearsing before the real photos exist

- **The mechanics** work with a single submission, as long as that entry is
  paid for: the judging page lists only photos whose author has a `payments`
  row, so an unpaid contest shows an empty grid no matter what the mirror
  holds.
- **The scale** (grid scrolling, memory, zoom) can be simulated: clone the
  pulled rows into a throwaway contest id and judge that. Never clone into
  `uw-2026`, or the push would carry the clones to production.
- **The remote write** is the one step that cannot be proven locally. Rehearse
  it once against a dummy contest id: create the contest row in production, push
  a couple of flags to it, check the counts, delete it.

## Notes and limits

- Full-size files are re-encoded to webp at quality 90, visually lossless at the
  zoom levels used during judging, but not byte-identical to the originals.
- Pull and push must cover the same rows. The pull takes all `judging_flags` and
  `results` for the contest (not only paid authors'), because the push clears
  them for the whole contest. Changing one without the other loses rows.
- Do not judge on production at the same time: two divergent databases, and the
  push overwrites the contest's rows.
