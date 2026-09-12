# Explore catalog replica

Reference: user-supplied Upsurge.club catalog screenshot, September 12, 2026.

- Main platform `/en/courses` and `/es/courses` use the replica header and catalog. School catalogs retain their existing database-backed implementation.
- The six reference course records are stored in `components/public/upsurge-catalog-data.json`. Their original public image URLs are recorded alongside locally optimized WebP assets.
- The heading statistics and first-row prices/learner counts reproduce the screenshot; they are not live LMS data. These six records are a reference collection, not the full 379-course catalog.
- Cards open their real course pages on upsurge.club. No courses, prices, enrollments, or checkout behavior were added to the database.
- Search, category, PRO eligibility, level, and sort settings are URL-backed and can be combined. Clear filters restores the default collection. The back-to-top control respects reduced-motion preferences.
- Dependency restoration used `npm ci --ignore-scripts`; the existing lockfile changes were preserved.

Validation: focused ESLint passed. Repository-wide TypeScript checking was stopped after a prolonged stall without a result. Browser evidence is saved alongside this note.

Final browser validation passed at 1917px and 390px: bundled Figtree loaded, six initial cards, category filtering (three cards), combined category/PRO filtering (one card), sort and level controls, empty state/reset, search submission, and back-to-top. No page/console errors, broken thumbnails, or horizontal overflow. Figtree is bundled using next/font/local and its OFL license is included in public/upsurge/.


Port 3000 correction: the user's old Educational Courses screen came from a separate Next.js process under D:\Lms-learn. That server was stopped and this workspace was started explicitly with npm run dev -- --port 3000. Fresh-browser verification at http://localhost:3000/en/courses returned 200, showed the Upsurge catalog and updated tab title, passed category/PRO filtering, and reported no page/console errors or mobile horizontal overflow. Evidence: localhost-3000-desktop.png and localhost-3000-mobile.png.

