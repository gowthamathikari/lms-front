# Profile page and search modal

Implemented from the two supplied screenshot references.

- Header and footer My Profile links open the locale-aware `/user/profile/edit` route.
- Profile loads the signed-in user and their RLS-protected profile. Name and resized avatar save to the profile; gender saves to user metadata. Email changes request confirmation. Phone is masked and read-only; verification reflects Auth status.
- Avatars are resized to 256px WebP data URLs stored in the existing avatar_url field. No new storage bucket or migration is required.
- Certificates and purchases link to existing dashboard pages. My Tickets links to the existing external contact destination.
- Header search opens an accessible modal with trending topics, categories, and the existing reference catalog. Three characters enable filtering and submission. Course links retain the catalog's external destinations.

## Validation

- Focused ESLint: passed for all changed/new TSX files.
- `git diff --check`: passed.
- `node docs/verification/upsurge-profile-search/check-components.cjs`: passed. Exercises the actual components in Chrome with mocked Supabase and Next.js navigation: autofocus, matching and empty search results, submit destination, category links, Escape dismissal, required name, save success/failure, gender, image validation/resizing, email confirmation feedback, and no horizontal overflow at 390px. No page exceptions.
- Desktop and mobile PNGs in this directory are **isolated component previews using fixture account data**, not authenticated live-app screenshots. Shared Tailwind layout utilities are approximated in the harness.
- Full `npm run build` and `npm run typecheck` stalled without completion and were stopped. No passing full-build/typecheck claim.
- Live homepage browser check timed out. The repository's existing test account could not authenticate, so live profile persistence and email delivery are unverified.
- `check.cjs` and `check-profile.cjs` retain the live integration checks for a responsive configured environment. They were not successful in this session.

Reference APIs consulted: https://supabase.com/docs/reference/javascript/auth-updateuser and https://supabase.com/docs/reference/javascript/update
