# Upsurge homepage replica

Reference: user-supplied desktop screenshot of https://www.upsurge.club/.
Course images and logo: public reference assets from https://images-cdn.upsurge.club/assets/home/banner/ and /assets/logo/, optimized locally to WebP.

The replica is shown on the main platform homepage only. School landing pages and other routes retain their existing layout.
Course search, account links and course discovery use existing local LMS routes. Webinars, mentorships and indicators link to the reference site because this LMS has no matching features.
Promotional text and statistics reproduce the supplied screenshot; they are reference content, not live LMS measurements. Reference course tiles search the local catalog; no course records or checkout prices have been imported.

Desktop and mobile browser checks: page returns HTTP 200, no horizontal overflow, both navigation menus open, course search targets the local catalog, no page exceptions.

Validation limitation: the full production build and repository-wide TypeScript check were stopped after prolonged stalls without results. Focused ESLint and browser checks are used for this change.
