# Issue delivery review

Base: origin/develop `3f56ee2`. Order: #7, #10, #8, #9, #11.

## #7 — Simple drill table naming

Changed product copy in the current app and published legacy HTML. Reviewed the diff: only titles and explanatory text changed; IDs, formulas, layout, data and exercise generation remain intact. No surname references remain in public source text. The Simple exception for to be and modal verbs is retained.

Validation: 16 unit tests pass, including exhaustive parity of all 7,344 generated English/Russian combinations against legacy HTML. Formatting checked for modified TypeScript files. No unresolved review findings.

## #10 — UI localization and learning-content boundary

Implemented typed semantic UI keys, ru/en/de resources, interpolation, Intl plural/number/date formatting, browser-language selection, isolated persistence, Russian fallback and development warnings. React and stores share one translator. Russian learning data and generator text now live under locales/content/ru; domain identifiers and English answer checks remain unchanged.

Review findings fixed before commit: shared MobX components now participate in Fast Refresh lint checks; fallback plurals follow the fallback resource's language; native select fields stack on mobile to show long German labels; hidden skip link remains accessible without appearing in full-page captures. Reviewed all four screens, dynamic store messages, accessibility labels, storage keys and content language attributes. No unresolved findings.

Validation: lint, TypeScript/build and 21 unit tests pass, including resource keys/parameters/plural categories, fallback, browser detection, denied storage, state preservation and exhaustive generator parity. 18 browser tests pass on desktop and emulated iPhone/Chrome; 2 PR-only tests are intentionally skipped in app mode. Browser coverage includes all sections, ru/en/de switching, persisted theme/locale/progress, retained answer/retry/custom set, denied storage and all three locales after offline reload. German desktop/mobile screenshots inspected. Formatting passes. No new dependencies.

## #8 — Remove the global combination summary

Removed the shell-only summary, its catalog import, both desktop/mobile styles and the unused key in all UI locales. Reviewed the remaining daily row: the goal and progress bar remain intact for this commit, and no empty summary container or replacement metric remains. Exercise catalog and available tense selection are untouched. No unresolved findings.

Validation: formatting, lint and production build pass; existing drill/theme/table browser smoke passes on desktop and mobile. Generator code is unchanged.

## #9 — Remove daily progress from the shared shell

Removed the complete daily shell row and its remaining responsive styles, imports and locale keys. Updated the design context to reflect the requested shell. Reviewed persistence and lifecycle: daily refresh remains active, and no progress store or storage behavior changed. The progress page goal and drill-round indicator remain in their own sections. No replacement widget or blank row remains. No unresolved findings.

Validation: formatting, lint and build pass. Four desktop/mobile browser scenarios for drill navigation/theme and persisted translation progress/filtering/reset pass. Review confirms the shared row is absent for every section because it no longer exists in the shell component.

## #7 follow-up — Consistent selector labels

Applied the user's follow-up: every specific tense/aspect option now uses only the English grammar name (Simple, Continuous, Perfect, Perfect Continuous, Present Perfect). All-tenses/custom-set options remain descriptive. The full Simple drill-table title remains in the reference heading. Removed unused locale keys. Reviewed the shared selector so all sections and UI languages get the same labels.

Validation: formatting, lint, build and desktop/mobile drill/table-selection smoke pass. No learning or persistence changes.

## #10 follow-up — Aligned flags and translated reference content

Applied the user's explicit request to replace the visible language label/select with flag buttons. Native language names remain as tooltips and accessible button names; selected language uses aria-pressed, each target is 44px, and the theme control shares the same aligned toolbar. This requested flag UI supersedes the original issue preference for visible native names.

Added separate ru/en/de reference content packs for tense descriptions, formula guidance, table explanations and German example translations. Reference content follows the displayed UI as requested; translation exercises retain their independent Russian-to-English content pack and checking. English tables avoid repeating their English originals as translations. Updated the content-boundary notice.

Review: no exercise generator or saved state changes. Browser assertions confirm matching toolbar centers and no Cyrillic remains in the full English/German reference, including all 12 tenses. Header desktop/mobile screenshots inspected. Validation: lint, build, 21 unit tests and 22 desktop/mobile browser tests pass (2 PR-only skips in app mode). No unresolved findings.

## #11 — Everyday examples with progressive disclosure

Added 24 different everyday situations, 48 main English examples and 12 contrast pairs (24 further English sentences). Russian, English and German reference packs supply contexts, translations, individual explanations and the rare-form note. Stable tense/situation/example IDs join English originals to content packs; components contain no lesson prose. Reviewed all examples for tense formation, time anchors, natural context, translation and contrast meaning. The Future Perfect Continuous note explicitly avoids presenting this uncommon form as an everyday requirement.

The map has a separate Examples button in each cell; selecting a tense still belongs to the main button. Only one lesson and one two-example situation are visible at a time; contrast is an opt-in disclosure. Focus moves to the lesson and returns to the originating control on close/Escape. No modal, drill mutation or translation navigation is involved.

Review findings fixed: the lesson is placed below the map; table-cell flex layout prevents an example trigger overflowing under the next row; long mobile lesson titles and close controls now share a compact heading. Content/source separation, keyboard handling, selected-state announcements and language attributes reviewed. Mechanical UI detector reports no findings. Desktop/mobile screenshots of the map and expanded lesson inspected. No unresolved findings.

Validation: format, lint, TypeScript and production build pass; 24 unit tests pass, including all content IDs/contexts/translations, all UI keys/plurals and all 7,344 legacy generator combinations. App-mode browser suite: 26 passed, 2 PR-only skips. PR-mode browser suite: 24 passed, 4 offline-only skips. All 12 lessons tested with Enter/Escape, scenario switching, contrast disclosure, preserved selection/round, mouse click, Space, locale switching and no horizontal overflow of explanations. Seven Pages planning/packaging tests pass. Mobile checks use emulated iPhone/Chrome, not a physical device.


## #17 — Storage test formatting recheck (2026-10-18)

Rechecked on develop f791a98. Prettier produces no diff for src/storage/local.test.ts; the reported formatting problem is not present in this committed revision. No behavioral or cosmetic change was manufactured. `npm run format:check` passes and all 45 unit tests pass. Formatting remains a required workflow gate.


## Develop maintenance review — 2026-10-18

Base: `origin/develop` at `f791a98`; work branch: `codex/develop-cleanup`. Scope: domain generators/formulas, drill and translation lifecycle, progress persistence/migration, UI locale resources, app navigation/PWA lifecycle, and Pages checks/planning/packaging. This was a code and regression review, not an external penetration test or a linguistic rewrite of the legacy pack.

### Delivered independently

| Item | Outcome |
| --- | --- |
| Calendar | All practice is the default; drill/translation filters remain. German label is `Alle Übungen`. Browser assertions cover mixed activity and translations without drills. The fixture uses a fixed mid-month date so mobile tests also work when run on the first day of a month. |
| #17 | Not reproducible on committed develop: formatting the named file produces no tracked diff. Full format check passes. Kept a separate verification commit instead of manufacturing a code change. |
| #18 | Locale switching checks an existing nonempty v2 HISTORY_KEY plus in-memory data/stats, learning state and theme. |
| #19 | Removed unused export/import/reset/restore methods, their exclusively supporting tests/resources, the obsolete v1 reader and backup parser. Automatic v1 migration and raw backups remain. Invalid/unknown schemas, denied reads/writes, quota errors and stale-tab conflicts retain test coverage. Channel-isolation tests now exercise v2. |
| #21 | Verb tuples became named fields, including named Russian past genders. All 7,344 original English/Russian combinations pass exhaustive parity; order remains intact. No wording changes were mixed into that refactor commit. |
| #20 | Shared composite action runs the full frontend validation for each source revision. Separate tooling checkout uses immutable github.workflow_sha, including closed-PR events; channels, preview metadata, permissions, matrix error isolation and publishing gates remain. actionlint passes; live GitHub event verification is documented in docs/deployment.md. |
| #16 | Added it/computer/train/phone with reviewed subject/verb pairs, third-person agreement, Russian gender and perfective forms for the new content. Original combinations remain available; full pool is 7,560. Filters, retries, normal drills, every tense/form and formula agreement are covered. |
| Packaging review fix | Validate the root version-selector index.html before deleting the previous output. A regression test failed before the fix and passes after it. This protects the local package directory; the live site only changes after deployment succeeds. |

### Review assessment and remaining work

A focused cleanup was justified and is now implemented. The existing domain/store/feature/storage boundaries are appropriate for this static practice app; a framework migration, backend, general-purpose recovery framework or blanket rewrite would add work without addressing the findings above.

Two useful follow-ups remain outside the six issues:

1. **P2 — Contraction comparison is incomplete and ambiguous** (`frontend/src/domain/answers.ts`, lines 15–24). `he's` and `she's` always expand to *is*, so a valid answer such as “She's written a report” differs from “She has written a report”. `it's` is not expanded at all. A later change should compare context-aware alternatives and test both *is* and *has*, rather than blindly adding one expansion. This affects comparison feedback, not user-controlled self-assessment or stored totals.
2. **P3 — Legacy content still needs an editorial pass.** Exhaustive parity deliberately preserves its known linguistic limitations; it proves migration stability, not teaching quality. Review Russian aspect, context and natural combinations as a separate content task with approved examples. New inanimate pairs are constrained and use explicit perfective forms; they do not repair the original pack.

### Validation

- 48 unit tests pass, including all 7,344 legacy English/Russian pairs, locale persistence and storage safety.
- Frontend lint, format check, TypeScript and production build pass.
- App browser coverage runs on desktop and emulated iPhone, including navigation, filters, keyboard, progress, all three locales, speech and offline reload. Final run recorded in the delivery response; PR-only tests intentionally skip in app mode.
- PR channel `pr-3`: production build plus four desktop/mobile tests pass (network-only reload, absence of service worker, new subject filters).
- Eight Node planner/packaging tests pass; actionlint reports no workflow issues. The Impeccable detector reports no findings for ActivityCalendar/Translation.
- GitHub Actions itself has not run for these local commits. Event-driven publication/cleanup acceptance scenarios are documented; do not treat local checks as a deployed release.

The generated `.impeccable/` work artifacts are ignored; source files and regression evidence stay in version control. Existing separate migration-worktree files were not changed by this maintenance work.
