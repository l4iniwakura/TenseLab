# Issue delivery review

Base: origin/develop `3f56ee2`. Order: #7, #10, #8, #9, #11.

## #7 — Simple drill table naming

Changed product copy in the current app and published legacy HTML. Reviewed the diff: only titles and explanatory text changed; IDs, formulas, layout, data and exercise generation remain intact. No surname references remain in public source text. The Simple exception for to be and modal verbs is retained.

Validation: 16 unit tests pass, including exhaustive parity of all 7,344 generated English/Russian combinations against legacy HTML. Formatting checked for modified TypeScript files. No unresolved review findings.
