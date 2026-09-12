# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LMS V2 is a modern Learning Management System built with Next.js 16 and Supabase. This is a complete rebuild prioritizing exceptional UX for students and teachers. The project uses **Row Level Security (RLS) for direct database queries** instead of server actions for CRUD operations.

**Key Technologies:**

- Next.js 16.1.5 (App Router, React 19)
- Supabase (PostgreSQL 15, Auth, Storage)
- Shadcn UI (base-mira theme)
- Tailwind CSS v4
- TypeScript (strict mode)
- Stripe for payments

## Commands

### Development

```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build for production (checks TypeScript/lint errors)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database (Supabase)

```bash
supabase db pull     # Pull schema from cloud
supabase db push     # Push migrations to cloud
supabase migration new <name>  # Create new migration file
```

**Important**: Database migrations are in `supabase/migrations/`. The database has 44 tables with comprehensive RLS policies.

## Available Skills

This project has custom Claude Code skills available in `skills/`:

### `/web-design-guidelines`

Review UI code for Web Interface Guidelines compliance. Use this skill when:

- Reviewing UI implementations
- Checking accessibility compliance
- Auditing design patterns
- Ensuring best practices for web interfaces

**Usage:**

```bash
/web-design-guidelines app/dashboard/student/page.tsx
/web-design-guidelines "app/dashboard/**/*.tsx"
```

This skill fetches the latest Web Interface Guidelines and validates code against them, reporting findings in `file:line` format.

## MCP Integration

This project includes a **Model Context Protocol (MCP) server** that allows AI assistants like Claude to interact with the LMS database through secure, authenticated tools.

### What is MCP?

MCP enables AI assistants to:
- Create and manage courses, lessons, and exams
- View student progress and submissions
- Access course content and metadata
- Perform CRUD operations with proper authentication

### Security Model

The MCP server uses **HTTP Proxy Authentication**:
- No credentials stored in Claude or external tools
- Users authenticate through existing LMS session (cookies)
- All actions tracked per user with full audit trail
- Role-based access (teachers and admins only)
- Rate limiting: 100 requests/minute per user

### Quick Start

1. **Start the MCP server**:
   ```bash
   cd mcp-server
   npm install
   npm run build
   npm run start:http
   ```

2. **Configure environment**: Ensure `.env` has Supabase credentials and shared secret

3. **Connect Claude**: Add MCP server in Claude settings at `http://localhost:3001/mcp`

### Available Capabilities

- **27 tools** for course/lesson/exam/exercise management
- **3 resources** for accessing course, lesson, and exam data
- **4 prompts** for guided content creation
- **Full audit trail** in `mcp_audit_log` table

### Documentation

- **[MCP Setup Guide](docs/MCP_SETUP.md)** - Complete setup instructions
- **[MCP Server README](mcp-server/README.md)** - Technical documentation
- Architecture: HTTP proxy → MCP server → Supabase with RLS

### Audit Trail

All MCP actions are logged to the `mcp_audit_log` table:
- User ID and role
- Tool/method called
- Success/failure status
- Request duration
- Sanitized parameters (sensitive data redacted)

Query recent activity:
```sql
SELECT * FROM mcp_audit_log ORDER BY created_at DESC LIMIT 50;
```

## Architecture & Key Patterns

### 1. Database Queries via RLS (Core Pattern)

**DO THIS** - Direct queries with RLS protection:

```typescript
// Server component
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data } = await supabase
  .from("courses")
  .select("*, lessons(count)")
  .eq("id", courseId)
  .single();
```

**AVOID THIS** - Server actions for simple CRUD:

```typescript
// ❌ Don't create server actions for basic queries
async function getCourse(id: number) {
  "use server";
  // ... server action for simple query
}
```

**When to use server actions:**

- Complex multi-step operations (e.g., payment processing)
- Operations requiring service role permissions
- External API interactions
- Business logic that shouldn't be exposed to client

### 2. Authentication & Authorization

**JWT Claims**: User roles are injected into JWT via `custom_access_token_hook()` database function.

**Getting user role:**

```typescript
import { getUserRole } from "@/lib/supabase/get-user-role";

const role = await getUserRole(); // 'student' | 'teacher' | 'admin' | null
```

**Roles:**

- `student` (default) - Can enroll in and complete courses
- `teacher` - Can create and manage courses
- `admin` - Full system access

**Route protection**: Middleware handles role-based routing. Protected routes redirect based on user role:

- `/dashboard/student` - Students only
- `/dashboard/teacher` - Teachers and admins
- `/dashboard/admin` - Admins only

### 3. Component Structure

**Prefer server components:**

```typescript
// ✅ Server component fetches data
export default async function CoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  return <CourseView course={course} />
}
```

**Use client components only when needed:**

- Interactive features (forms, buttons with state)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)

Mark client components with `'use client'` directive.

### 4. File Structure

```
app/
├── auth/                      # Auth pages (login, signup, etc.)
├── dashboard/
│   ├── student/              # Student dashboard & features
│   ├── teacher/              # Teacher dashboard & features
│   └── admin/                # Admin dashboard
├── api/
│   └── stripe/               # Stripe webhooks & payment APIs
└── layout.tsx

components/
├── ui/                       # Shadcn components (auto-generated)
├── student/                  # Student-specific components
└── teacher/                  # Teacher-specific components

lib/
├── supabase/
│   ├── client.ts            # Client-side Supabase client
│   ├── server.ts            # Server-side Supabase client
│   ├── get-user-role.ts     # Role detection utilities
│   └── middleware.ts        # Session management for middleware
├── stripe.ts                # Stripe client
└── utils.ts                 # Utilities (cn helper, etc.)

docs/                        # Comprehensive documentation
├── PROJECT_OVERVIEW.md      # Architecture & goals
├── DATABASE_SCHEMA.md       # Complete schema reference
├── AUTH.md                  # Authentication flows
└── AI_AGENT_GUIDE.md        # AI-specific development patterns
```

## Database Schema Essentials

### Core Tables

**Users & Roles:**

- `profiles` - User profiles (auto-created on signup)
- `user_roles` - Role assignments (many-to-many)

**Content:**

- `courses` - Course catalog
- `lessons` - Course lessons (MDX content)
- `exercises` - Practice exercises
- `exams` - Assessments with questions
- `exam_questions` - Individual questions
- `question_options` - Multiple choice options

**Progress Tracking:**

- `enrollments` - Course access
- `lesson_completions` - Lesson progress
- `exam_submissions` - Exam attempts with AI feedback

**Commerce:**

- `products` - Individual course products
- `plans` - Subscription plans
- `transactions` - Payment records
- `subscriptions` - Active subscriptions

### Key Database Functions

**Must know:**

```typescript
// Enroll user in courses linked to product
await supabase.rpc("enroll_user", {
  _user_id: userId,
  _product_id: productId,
});

// Create exam submission
await supabase.rpc("create_exam_submission", {
  student_id: userId,
  exam_id: examId,
  answers: { "1": "answer text", "2": "option_id" },
});

// Save AI feedback for exam
await supabase.rpc("save_exam_feedback", {
  submission_id: submissionId,
  exam_id: examId,
  student_id: userId,
  answers: answersJson,
  overall_feedback: feedbackText,
  score: scoreNumber,
});
```

**Triggers:**

- `handle_new_user()` - Auto-creates profile and assigns 'student' role on signup
- `trigger_manage_transactions()` - Auto-processes successful payments

### Common Query Patterns

**Course with nested data:**

```typescript
const { data } = await supabase
  .from("courses")
  .select(
    `
    *,
    lessons (
      *,
      lesson_completions (completed_at)
    ),
    enrollments (enrolled_at)
  `,
  )
  .eq("id", courseId)
  .eq("lessons.lesson_completions.student_id", userId)
  .order("sequence", { foreignTable: "lessons" })
  .single();
```

**Student's enrolled courses:**

```typescript
const { data } = await supabase
  .from("enrollments")
  .select(
    `
    *,
    course:courses (
      *,
      lessons (count)
    )
  `,
  )
  .eq("user_id", userId)
  .eq("status", "active");
```

## Development Guidelines

### Code Style

**TypeScript:**

- Use strict mode (already configured)
- Avoid `any` type - use proper interfaces
- Path alias `@/*` maps to root directory

**Component patterns:**

```typescript
// ✅ Proper typing
interface CourseCardProps {
  course: {
    id: number
    title: string
    status: 'draft' | 'published' | 'archived'
  }
}

// ✅ Server component by default
export default async function Page() { ... }

// ✅ Client component when needed
'use client'
export function InteractiveForm() { ... }
```

**Styling:**

- Use Tailwind utility classes
- Use `cn()` helper for conditional classes
- Avoid inline styles
- Use Shadcn components: `npx shadcn@latest add [component]`

### Error Handling

Always handle loading, error, and empty states:

```typescript
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('id', courseId)
  .single()

if (error || !data) {
  redirect('/dashboard/student')
}

// Safe to use data
return <CourseView course={data} />
```

### Don't Over-Engineer

**Keep it simple:**

- Build what's needed, not what might be needed
- Use direct queries instead of abstractions
- Don't create helpers for one-time operations
- No premature optimization

**Example of what NOT to do:**

```typescript
// ❌ Don't create complex abstractions
class CourseRepository {
  async findById(id: number) { ... }
  async findAll() { ... }
  // ... 20 more methods
}

// ✅ Instead, use direct queries where needed
const { data } = await supabase.from('courses').select('*').eq('id', id).single()
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

**Security:** Never commit `.env.local`. Service role key bypasses RLS - use only for admin operations.

## Current Phase & Status

**Phase 6 (In Progress)**: Teacher Dashboard

- ✅ Course creation and management
- ✅ Lesson editor (MDX)
- ✅ Exam builder
- ⏳ Student submission review (pending)

**Completed:**

- Phase 1: Fresh Next.js 16 + Shadcn UI
- Phase 2: Complete database schema (44 tables)
- Phase 3: Authentication with role-based routing
- Phase 4: Stripe payment integration
- Phase 5: Student Dashboard (lessons, exams, progress tracking)

**Reference implementations:**

- Student dashboard: `app/dashboard/student/` (complete, use as pattern reference)
- Teacher features: `app/dashboard/teacher/` (in progress)
- Components: `components/student/` and `components/teacher/`

## Key Documentation Files

Before making changes, read:

1. `docs/PROJECT_OVERVIEW.md` - Architecture and design principles
2. `docs/DATABASE_SCHEMA.md` - Complete schema with relationships
3. `docs/AUTH.md` - Authentication and authorization flows
4. `docs/AI_AGENT_GUIDE.md` - Detailed patterns and examples
5. `docs/DEVELOPMENT_WORKFLOW.md` - Step-by-step development process

## Common Pitfalls to Avoid

1. **Don't bypass RLS** unless absolutely necessary (admin operations only)
2. **Don't use server actions** for simple CRUD - use RLS-protected direct queries
3. **Don't create new patterns** without checking existing implementations first
4. **Always authenticate server components** that access protected data
5. **Use `createClient()` correctly**:
   - `@/lib/supabase/server` for server components/routes
   - `@/lib/supabase/client` for client components
6. **Handle auth redirects properly** - check user exists before accessing protected data

## Testing Checklist

Before committing:

- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] Feature works as expected (manual test)
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Mobile responsive
- [ ] No console errors
- [ ] RLS policies allow correct access
- [ ] Tested with appropriate user role(s)

## Git Workflow

Current branch: `v2-rebuild`
Main branch: `master`

```bash
# Commit format
git commit -m "feat: add course progress tracking

- Add progress calculation
- Create progress component
- Update course card to show progress"

# Push changes
git push origin v2-rebuild
```

## Additional Notes

- **Middleware**: Uses `lib/supabase/middleware.ts` for session management and role-based redirects
- **Payments**: Stripe webhooks at `/api/stripe/webhook` handle successful payments and trigger enrollments
- **AI Integration**: Placeholder for future Gemini 2.0 integration (exam grading, exercise help)
- **TypeScript config**: Uses `@/*` path alias, JSX mode is `react-jsx`, target is ES2017

For detailed examples and patterns, always refer to the comprehensive documentation in the `docs/` directory.

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./node_modules/next/dist/docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app:{04-glossary.md}|01-app/01-getting-started:{01-installation.md,02-project-structure.md,03-layouts-and-pages.md,04-linking-and-navigating.md,05-server-and-client-components.md,06-fetching-data.md,07-mutating-data.md,08-caching.md,09-revalidating.md,10-error-handling.md,11-css.md,12-images.md,13-fonts.md,14-metadata-and-og-images.md,15-route-handlers.md,16-proxy.md,17-deploying.md,18-upgrading.md}|01-app/02-guides:{ai-agents.md,analytics.md,authentication.md,backend-for-frontend.md,caching-without-cache-components.md,cdn-caching.md,ci-build-caching.md,content-security-policy.md,css-in-js.md,custom-server.md,data-security.md,debugging.md,deploying-to-platforms.md,draft-mode.md,environment-variables.md,forms.md,how-revalidation-works.md,incremental-static-regeneration.md,instant-navigation.md,instrumentation.md,internationalization.md,json-ld.md,lazy-loading.md,local-development.md,mcp.md,mdx.md,memory-usage.md,migrating-to-cache-components.md,multi-tenant.md,multi-zones.md,open-telemetry.md,package-bundling.md,ppr-platform-guide.md,prefetching.md,preserving-ui-state.md,preventing-flash-before-hydration.md,production-checklist.md,progressive-web-apps.md,public-static-pages.md,redirecting.md,rendering-philosophy.md,sass.md,scripts.md,self-hosting.md,server-actions.md,single-page-applications.md,static-exports.md,streaming.md,tailwind-v3-css.md,third-party-libraries.md,videos.md,view-transitions.md}|01-app/02-guides/migrating:{app-router-migration.md,from-create-react-app.md,from-vite.md}|01-app/02-guides/testing:{cypress.md,jest.md,playwright.md,vitest.md}|01-app/02-guides/upgrading:{codemods.md,version-14.md,version-15.md,version-16.md}|01-app/03-api-reference:{07-edge.md,08-turbopack.md}|01-app/03-api-reference/01-directives:{use-cache-private.md,use-cache-remote.md,use-cache.md,use-client.md,use-server.md}|01-app/03-api-reference/02-components:{font.md,form.md,image.md,link.md,script.md}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.md,manifest.md,opengraph-image.md,robots.md,sitemap.md}|01-app/03-api-reference/03-file-conventions/02-route-segment-config:{dynamicParams.md,instant.md,maxDuration.md,preferredRegion.md,runtime.md}|01-app/03-api-reference/03-file-conventions:{default.md,dynamic-routes.md,error.md,forbidden.md,instrumentation-client.md,instrumentation.md,intercepting-routes.md,layout.md,loading.md,mdx-components.md,not-found.md,page.md,parallel-routes.md,proxy.md,public-folder.md,route-groups.md,route.md,src-folder.md,template.md,unauthorized.md}|01-app/03-api-reference/04-functions:{after.md,cacheLife.md,cacheTag.md,catchError.md,connection.md,cookies.md,draft-mode.md,fetch.md,forbidden.md,generate-image-metadata.md,generate-metadata.md,generate-sitemaps.md,generate-static-params.md,generate-viewport.md,headers.md,image-response.md,next-request.md,next-response.md,not-found.md,permanentRedirect.md,redirect.md,refresh.md,revalidatePath.md,revalidateTag.md,unauthorized.md,unstable_cache.md,unstable_noStore.md,unstable_rethrow.md,updateTag.md,use-link-status.md,use-params.md,use-pathname.md,use-report-web-vitals.md,use-router.md,use-search-params.md,use-selected-layout-segment.md,use-selected-layout-segments.md,userAgent.md}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.md,allowedDevOrigins.md,appDir.md,assetPrefix.md,authInterrupts.md,basePath.md,cacheComponents.md,cacheHandlers.md,cacheLife.md,compress.md,crossOrigin.md,cssChunking.md,deploymentId.md,devIndicators.md,distDir.md,env.md,expireTime.md,exportPathMap.md,generateBuildId.md,generateEtags.md,headers.md,htmlLimitedBots.md,httpAgentOptions.md,images.md,incrementalCacheHandlerPath.md,inlineCss.md,logging.md,mdxRs.md,onDemandEntries.md,optimizePackageImports.md,output.md,pageExtensions.md,poweredByHeader.md,productionBrowserSourceMaps.md,proxyClientMaxBodySize.md,reactCompiler.md,reactMaxHeadersLength.md,reactStrictMode.md,redirects.md,rewrites.md,sassOptions.md,serverActions.md,serverComponentsHmrCache.md,serverExternalPackages.md,staleTimes.md,staticGeneration.md,taint.md,trailingSlash.md,transpilePackages.md,turbopack.md,turbopackFileSystemCache.md,turbopackIgnoreIssue.md,turbopackLocalPostcssConfig.md,typedRoutes.md,typescript.md,urlImports.md,useLightningcss.md,useTypeScriptCli.md,viewTransition.md,webVitalsAttribution.md,webpack.md}|01-app/03-api-reference/05-config:{02-typescript.md,03-eslint.md}|01-app/03-api-reference/06-cli:{create-next-app.md,next.md}|01-app/03-api-reference/07-adapters:{01-configuration.md,02-creating-an-adapter.md,03-api-reference.md,04-testing-adapters.md,05-routing-with-next-routing.md,06-implementing-ppr-in-an-adapter.md,07-runtime-integration.md,08-invoking-entrypoints.md,09-output-types.md,10-routing-information.md,11-use-cases.md}|02-pages/01-getting-started:{01-installation.md,02-project-structure.md,04-images.md,05-fonts.md,06-css.md,11-deploying.md}|02-pages/02-guides:{analytics.md,authentication.md,babel.md,ci-build-caching.md,content-security-policy.md,css-in-js.md,custom-server.md,debugging.md,draft-mode.md,environment-variables.md,forms.md,incremental-static-regeneration.md,instrumentation.md,internationalization.md,lazy-loading.md,mdx.md,multi-zones.md,open-telemetry.md,package-bundling.md,post-css.md,preview-mode.md,production-checklist.md,redirecting.md,sass.md,scripts.md,self-hosting.md,static-exports.md,tailwind-v3-css.md,third-party-libraries.md}|02-pages/02-guides/migrating:{app-router-migration.md,from-create-react-app.md,from-vite.md}|02-pages/02-guides/testing:{cypress.md,jest.md,playwright.md,vitest.md}|02-pages/02-guides/upgrading:{codemods.md,version-10.md,version-11.md,version-12.md,version-13.md,version-14.md,version-9.md}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.md,02-dynamic-routes.md,03-linking-and-navigating.md,05-custom-app.md,06-custom-document.md,07-api-routes.md,08-custom-error.md}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.md,02-static-site-generation.md,04-automatic-static-optimization.md,05-client-side-rendering.md}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.md,02-get-static-paths.md,03-get-server-side-props.md,05-client-side.md}|02-pages/03-building-your-application/06-configuring:{12-error-handling.md}|02-pages/04-api-reference:{06-edge.md,08-turbopack.md}|02-pages/04-api-reference/01-components:{font.md,form.md,head.md,image-legacy.md,image.md,link.md,script.md}|02-pages/04-api-reference/02-file-conventions:{instrumentation.md,proxy.md,public-folder.md,src-folder.md}|02-pages/04-api-reference/03-functions:{get-initial-props.md,get-server-side-props.md,get-static-paths.md,get-static-props.md,next-request.md,next-response.md,use-params.md,use-report-web-vitals.md,use-router.md,use-search-params.md,userAgent.md}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.md,allowedDevOrigins.md,assetPrefix.md,basePath.md,bundlePagesRouterDependencies.md,compress.md,crossOrigin.md,deploymentId.md,devIndicators.md,distDir.md,env.md,exportPathMap.md,generateBuildId.md,generateEtags.md,headers.md,httpAgentOptions.md,images.md,logging.md,onDemandEntries.md,optimizePackageImports.md,output.md,pageExtensions.md,poweredByHeader.md,productionBrowserSourceMaps.md,proxyClientMaxBodySize.md,reactStrictMode.md,redirects.md,rewrites.md,serverExternalPackages.md,trailingSlash.md,transpilePackages.md,turbopack.md,typescript.md,urlImports.md,useLightningcss.md,useTypeScriptCli.md,webVitalsAttribution.md,webpack.md}|02-pages/04-api-reference/04-config:{01-typescript.md,02-eslint.md}|02-pages/04-api-reference/05-cli:{create-next-app.md,next.md}|02-pages/04-api-reference/06-adapters:{01-configuration.md,02-creating-an-adapter.md,03-api-reference.md,04-testing-adapters.md,05-routing-with-next-routing.md,06-implementing-ppr-in-an-adapter.md,07-runtime-integration.md,08-invoking-entrypoints.md,09-output-types.md,10-routing-information.md,11-use-cases.md}|03-architecture:{accessibility.md,fast-refresh.md,nextjs-compiler.md,supported-browsers.md}|04-community:{01-contribution-guide.md,02-rspack.md}<!-- NEXT-AGENTS-MD-END -->
