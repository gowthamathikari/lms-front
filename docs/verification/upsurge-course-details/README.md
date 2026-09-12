# Local course details

Course cards previously linked to https://www.upsurge.club/course/... . Catalog and search results now use /{locale}/courses/{slug}.

The existing course detail route handles reference slugs for the main platform, renders the Upsurge shell, and retains database-backed numeric course routing. Unknown slugs return not found. The passive-income course outline was summarized from https://www.upsurge.club/course/passive-income-through-options-selling . Other catalog entries use existing local metadata, without invented lesson outlines.

Reference courses have no local product/enrollment mapping. The page states enrollment is unavailable and links to local pricing and the catalog. It does not initiate an external purchase.

Validation: focused ESLint has zero errors (three existing img warnings in the database course template). Isolated Chrome checks passed for desktop/mobile detail rendering, no overflow, local pricing links, and search/profile regressions. Screenshots are fixture previews, not live authenticated captures. Run `node docs/verification/upsurge-course-details/check.cjs` to reproduce them.
