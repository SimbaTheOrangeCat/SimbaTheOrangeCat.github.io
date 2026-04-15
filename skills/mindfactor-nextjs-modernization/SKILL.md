---
name: mindfactor-nextjs-modernization
description: Modernize the Mindfactor website from static HTML/CSS/JavaScript into a Next.js App Router site while preserving its warm editorial identity. Use when migrating pages, content, Supabase-backed features, design system, routing, SEO, and responsive behavior into a maintainable Next.js architecture.
---

# Mindfactor Next.js Modernization

Use this skill when working on the Mindfactor migration from the current static site into a Next.js App Router application.

## Core Intent

Preserve the site's identity while upgrading the implementation.

Keep:

- warm editorial tone
- mindful / cozy / minimal personality
- long-form readability
- dark mode
- personal, reflective feel

Improve:

- maintainability
- routing and content structure
- typography and spacing
- content hierarchy
- responsive behavior
- image handling
- page transitions and motion polish
- Supabase feature architecture
- search and discovery

Do not turn the site into a generic startup dashboard or an over-animated app shell.

## Technical Defaults

Assume these defaults unless the user overrides them:

- Next.js App Router
- TypeScript
- MDX for blog posts
- Supabase for auth, database, and storage
- Server Components by default
- Client Components only when interactivity is required
- clean slug-based blog routes under `/blog/[slug]`
- redirects from old `.html` pages to clean routes
- full Next.js-compatible deployment target

## Architecture Rules

- Prefer reusable layouts and components over repeated page markup.
- Prefer server-first rendering for content pages.
- Keep interactivity isolated in small Client Components.
- Do not use `window.*` globals for feature coordination.
- Centralize Supabase helpers under a shared `lib/supabase` area.
- Keep route structure content-first.

Recommended routes:

- `/`
- `/about`
- `/blog`
- `/blog/[slug]`
- `/search`
- `/journal`

Optional later routes:

- `/login`
- `/profile`

## Content Rules

- Move blog posts into MDX instead of standalone HTML.
- Use a single metadata source of truth per post.
- Include frontmatter fields for:
  - `slug`
  - `title`
  - `excerpt`
  - `category`
  - `tags`
  - `publishedAt`
  - `readTime`
  - `featured`
  - `coverImage`
  - `seoDescription`
- Generate blog listings and search data from content automatically.
- Preserve existing article tone and copy unless the user asks for editorial rewriting.

## Design Rules

- Preserve the current brand direction.
- Refine execution, not identity.
- Favor editorial composition over dashboard-like composition.
- Strengthen typography, spacing, and section hierarchy.
- Use restrained motion and meaningful transitions.
- Improve responsive layouts intentionally, not by simply shrinking desktop layouts.
- Use richer image presentation with consistent aspect ratios and responsive handling.

Avoid:

- generic component-library styling
- trend-heavy visual changes that erase the site's warmth
- heavy glassmorphism
- over-animated interactions
- unnecessary client-side JavaScript on content pages

## Feature Rules

Rebuild these as normal product features, not DOM-injected scripts:

- auth
- comments
- reactions
- bookmarks
- reflections
- journal

Behavior expectations:

- auth-required actions must reject logged-out users clearly
- comments support replies and ownership-aware deletion
- reactions allow one reaction per user per post
- bookmarks are per-user
- reflections are private per-user per-post
- journal remains private and authenticated

Do not preserve insecure frontend-only admin seeding or hardcoded credentials.

## Migration Order

Implement in this order unless the user requests a different sequence:

1. Create the Next.js foundation and root layout.
2. Migrate content into MDX and dynamic blog routes.
3. Rebuild homepage, about page, blog listing, and search.
4. Apply the visual refresh.
5. Rebuild Supabase auth architecture.
6. Rebuild comments, reactions, bookmarks, reflections, and journal.
7. Add SEO, redirects, and launch polish.

## Quality Bar

Treat the work as complete only when:

- shared layout is no longer duplicated
- blog content has a single source of truth
- routes are clean and modern
- typography and spacing feel intentional
- mobile and tablet layouts are polished
- motion is subtle and useful
- image handling is upgraded
- search is content-driven
- Supabase features are rebuilt cleanly
- the result still feels unmistakably like Mindfactor

## Reference

Use [PROJECT_MODERNIZATION_PLAN.md](../../PROJECT_MODERNIZATION_PLAN.md) as the full implementation roadmap and source of truth for phasing, data contracts, and acceptance criteria.
