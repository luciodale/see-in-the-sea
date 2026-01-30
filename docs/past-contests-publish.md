# Past editions: when do results go live?

Past winners on the **public site** come from **static data**, not the database. The live app does not read past winners from the DB; it reads the static file `src/data/past-contests.ts` and images under `public/images/contests/`.

You will **not** push results live until you run the export script and commit & push the generated files.

---

## Step-by-step publish flow

1. **Judging**  
   Assign placements in the judging panel (stored in `judging_flags`).

2. **Submit results**  
   Click **Invia Risultati** in admin. This copies `judging_flags` → `results` for that contest only. Past contests’ results are untouched.

3. **Set contest inactive**  
   In admin (or DB), set the contest `status` to `inactive`. Only inactive contests are included in the export.

4. **Export locally (required for publish)**  
   Run:
   ```bash
   bun run export:contests
   ```
   This runs `scripts/export-past-contests.ts --remote`. It:
   - Queries D1 for contests with `status = 'inactive'` and their **results** (from the `results` table, not `judging_flags`).
   - Downloads images from R2, processes with sharp, writes to `public/images/contests/<year>/`.
   - Writes `src/data/past-contests.ts` (pastContestsData).

5. **Publish when ready**  
   Commit and push `src/data/past-contests.ts` and any new/updated files under `public/images/contests/`. Until you do this, **results are not live** on the website.

---

## Script reference

- **Package script:** `"export:contests": "bun scripts/export-past-contests.ts --remote"`
- **Script file:** `scripts/export-past-contests.ts`
