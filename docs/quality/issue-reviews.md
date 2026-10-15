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
