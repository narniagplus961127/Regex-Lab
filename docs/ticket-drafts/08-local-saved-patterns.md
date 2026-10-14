# 08: Save and reopen patterns in this browser

**What to build:** A visitor names and saves the current pattern, then returns to a local collection to reopen or delete it without signing in or using cloud storage.

**Blocked by:** 03 — Understand and copy the current pattern. Optional feature scope must also be confirmed.

**Status:** Optional draft — awaiting scope/breakdown approval; local tracker is configured.

- [ ] A visitor can name and save a valid pattern with its flags, matching intent, sample test text, and description.
- [ ] The saved collection survives page reload in the same browser and exposes an empty state when no patterns are saved.
- [ ] Opening a saved pattern restores its effective settings and test text; local matches and example state are recomputed without reusing a stale semantic explanation.
- [ ] A visitor can delete a saved pattern and see the collection update persistently.
- [ ] The interface clearly states that saving is browser-local, without accounts or cross-device synchronization.
- [ ] Denied, full, or corrupt storage produces useful feedback without breaking testing or copying.
- [ ] Save dialogs are usable by keyboard and on mobile.
- [ ] Behavior-focused checks cover save, reload, reopen, delete, stale-state prevention, and unavailable/corrupt storage.
